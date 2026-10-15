// @ts-nocheck
import * as raw from '../../node_modules/firebase/firestore/dist/esm/index.esm.js';
import { isLocalProdLocked } from './ProdWriteGuard';
import { planFirestoreAudit } from '../services/auditClassify';
import { reportAudit } from '../services/auditClient';
import { captureBatchBefores } from '../services/auditBatch';

const WRITE_NAMES = new Set([
  'setDoc',
  'addDoc',
  'updateDoc',
  'deleteDoc',
  'writeBatch',
  'runTransaction',
]);

function blockWrite(name: string) {
  if (!isLocalProdLocked()) return false;
  console.warn(`[read-only] blocked ${name}`);
  return true;
}

function roleChanged(before: unknown, after: unknown): boolean {
  if (!after || typeof after !== 'object' || !('role' in (after as object))) return false;
  if (!before || typeof before !== 'object' || !('role' in (before as object))) return true;
  return String((before as { role?: unknown }).role) !== String((after as { role?: unknown }).role);
}

function observeWrite(
  path: string,
  data: unknown,
  op: 'set' | 'delete',
  before: unknown,
  known: boolean,
  merge: boolean
) {
  const plan = planFirestoreAudit(path, op === 'delete' ? before : data, op);
  if (!plan) return;
  if (plan.action === 'permission_change' && op !== 'delete' && !roleChanged(before, data)) return;
  let action = plan.action;
  if (!plan.keepAction) {
    if (op === 'delete') action = 'delete';
    else if (known) action = before ? 'update' : 'create';
    else action = merge ? 'update' : 'create';
  }
  reportAudit({
    action,
    entityType: plan.entityType,
    entityId: plan.entityId,
    before,
    after: op === 'delete' ? null : data,
  });
}

function readBefore(ref: unknown): Promise<{ known: boolean; data: unknown }> {
  const unknownSnap = { known: false, data: null as unknown };
  if (!ref) return Promise.resolve(unknownSnap);
  return Promise.race([
    raw.getDoc(ref).then((snap: { exists?: () => boolean; data?: () => unknown }) => {
      if (snap && typeof snap.exists === 'function' && snap.exists() && snap.data) {
        return { known: true, data: snap.data() };
      }
      return { known: true, data: null };
    }).catch(() => unknownSnap),
    new Promise((resolve) => setTimeout(() => resolve(unknownSnap), 800)),
  ]);
}

function guardSensitive(name: string, fn: (...args: unknown[]) => unknown, op: 'set' | 'delete') {
  return (...args: unknown[]) => {
    if (blockWrite(name)) return Promise.resolve(undefined);
    const ref = args[0] as { path?: string } | undefined;
    const data = op === 'delete' ? null : args[1];
    const path = ref && ref.path ? String(ref.path) : '';
    const merge = Boolean((args[2] as { merge?: boolean } | undefined)?.merge);
    const root = path.split('/').filter(Boolean)[0] || '';
    const deferAttendanceDelete = op === 'delete' && (root === 'attendance' || root === 'attendance_records');
    const interesting = path && (planFirestoreAudit(path, data, op) || deferAttendanceDelete);
    if (!interesting) return fn(...args);
    return readBefore(ref).then((prior) => {
      const result = fn(...args);
      Promise.resolve(result).then(
        () => observeWrite(path, data, op, prior.data, prior.known, merge),
        () => undefined
      );
      return result;
    });
  };
}

export function writeBatch(...args: unknown[]) {
  const batch = raw.writeBatch(...args);
  const ops: Array<{ ref: unknown; path: string; data: unknown; op: 'set' | 'delete'; merge: boolean }> = [];
  return {
    set(ref: { path?: string }, data: unknown, options?: { merge?: boolean }) {
      ops.push({ ref, path: String(ref?.path || ''), data, op: 'set', merge: Boolean(options?.merge) });
      return batch.set(ref, data, options);
    },
    update(ref: { path?: string }, data: unknown) {
      ops.push({ ref, path: String(ref?.path || ''), data, op: 'set', merge: true });
      return batch.update(ref, data);
    },
    delete(ref: { path?: string }) {
      ops.push({ ref, path: String(ref?.path || ''), data: null, op: 'delete', merge: false });
      return batch.delete(ref);
    },
    commit() {
      if (isLocalProdLocked()) return Promise.resolve();
      return captureBatchBefores(ops, readBefore).then((priors) => {
        const pending = batch.commit();
        void Promise.resolve(pending).then(() => {
          ops.forEach((op, index) => {
            const prior = priors[index] || { known: false, data: null };
            observeWrite(op.path, op.data, op.op, prior.data, prior.known, op.merge);
          });
        }, () => undefined);
        return pending;
      });
    },
  };
}

export function runTransaction(...args: unknown[]) {
  if (blockWrite('runTransaction')) return Promise.resolve(undefined);
  return raw.runTransaction(...args);
}

export const setDoc = guardSensitive('setDoc', raw.setDoc, 'set');
export const updateDoc = guardSensitive('updateDoc', raw.updateDoc, 'set');
export const deleteDoc = guardSensitive('deleteDoc', raw.deleteDoc, 'delete');
export const addDoc = (...args: unknown[]) => {
  if (blockWrite('addDoc')) return Promise.resolve(undefined);
  const col = args[0] as { path?: string } | undefined;
  const data = args[1];
  const path = col && col.path ? String(col.path) : '';
  const result = raw.addDoc(...args);
  if (path) {
    void Promise.resolve(result).then(
      (ref: { id?: string }) => observeWrite(`${path}/${ref?.id || ''}`, data, 'set', null, true, false),
      () => undefined
    );
  }
  return result;
};

export const {
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteField,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  memoryLocalCache,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setLogLevel,
  where,
} = raw;
