// @ts-nocheck
import * as raw from '../../node_modules/firebase/firestore/dist/esm/index.esm.js';
import { isLocalProdLocked } from './ProdWriteGuard';

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

function guard(name: string, fn: (...args: unknown[]) => unknown) {
  return (...args: unknown[]) => {
    if (blockWrite(name)) return Promise.resolve(undefined);
    return fn(...args);
  };
}

export function writeBatch(...args: unknown[]) {
  const batch = raw.writeBatch(...args);
  if (!isLocalProdLocked()) return batch;
  return new Proxy(batch, {
    get(target, prop, receiver) {
      if (prop === 'commit') return () => Promise.resolve();
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export function runTransaction(...args: unknown[]) {
  if (blockWrite('runTransaction')) return Promise.resolve(undefined);
  return raw.runTransaction(...args);
}

export const setDoc = guard('setDoc', raw.setDoc);
export const addDoc = guard('addDoc', raw.addDoc);
export const updateDoc = guard('updateDoc', raw.updateDoc);
export const deleteDoc = guard('deleteDoc', raw.deleteDoc);

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
