import { newTenantCredentials } from './authRoutes';
import { recordAuditEvent } from './auditLog';
import { resetStudioOverride, saveStudioOverrides, studioPersistenceMode } from './studioOverrides';

export const TENANT_SYSTEM_CONFIG_PREFIXES = [
  'leave_policy_',
  'attendance_policy_',
  'public_holidays_',
  'attendance_shift_seed_rules_',
  'facility_licensing_',
] as const;

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/;

export interface PlatformActor {
  uid?: string;
  email?: string;
  role?: string;
  companyId?: string;
  ip?: string;
}

export interface PlatformDocStore {
  merge(path: string, data: Record<string, unknown>): Promise<void>;
  remove(path: string): Promise<void>;
  /** Document paths whose collection path equals `collectionPath`. */
  list(collectionPath: string): Promise<string[]>;
  read(path: string): Promise<Record<string, unknown> | null>;
  /** Document paths in `collectionPath` whose `field` equals one of `values`. */
  whereIn(collectionPath: string, field: string, values: string[]): Promise<string[]>;
}

export type PlatformResult =
  | { ok: true; status: number; body: Record<string, unknown> }
  | { ok: false; status: number; error: string };

let injectedStore: PlatformDocStore | null = null;

export function __setPlatformStoreForTests(store: PlatformDocStore | null): void {
  injectedStore = store;
}

export function __resetPlatformStoreForTests(): void {
  injectedStore = null;
}

export class PlatformAdminUnavailable extends Error {
  status = 503;
  constructor() {
    super('Firebase Admin is not configured');
  }
}

/** Tests inject a store. Every other caller uses the Admin SDK, or stops. */
async function openStore(): Promise<PlatformDocStore> {
  if (injectedStore) return injectedStore;
  if (studioPersistenceMode() !== 'firestore') throw new PlatformAdminUnavailable();
  const { getAdminFirestore } = await import('./firebaseAdmin');
  if (!getAdminFirestore()) throw new PlatformAdminUnavailable();
  return adminStore();
}

function adminStore(): PlatformDocStore {
  return {
    async merge(path, data) {
      const { getAdminFirestore } = await import('./firebaseAdmin');
      const db = getAdminFirestore();
      if (!db) throw new Error('Firestore admin is not available');
      await db.doc(path).set(data, { merge: true });
    },
    async remove(path) {
      const { getAdminFirestore } = await import('./firebaseAdmin');
      const db = getAdminFirestore();
      if (!db) throw new Error('Firestore admin is not available');
      await db.doc(path).delete();
    },
    async list(collectionPath) {
      const { getAdminFirestore } = await import('./firebaseAdmin');
      const db = getAdminFirestore();
      if (!db) throw new Error('Firestore admin is not available');
      const snap = await db.collection(collectionPath).get();
      return snap.docs.map((item) => item.ref.path);
    },
    async read(path) {
      const { getAdminFirestore } = await import('./firebaseAdmin');
      const db = getAdminFirestore();
      if (!db) throw new Error('Firestore admin is not available');
      const snap = await db.doc(path).get();
      if (!snap.exists) return null;
      return plain(snap.data() || {});
    },
    async whereIn(collectionPath, field, values) {
      const { getAdminFirestore } = await import('./firebaseAdmin');
      const db = getAdminFirestore();
      if (!db) throw new Error('Firestore admin is not available');
      const found = new Set<string>();
      for (let index = 0; index < values.length; index += 10) {
        const chunk = values.slice(index, index + 10);
        if (!chunk.length) continue;
        const snap = await db.collection(collectionPath).where(field, 'in', chunk).get();
        snap.docs.forEach((item) => found.add(item.ref.path));
      }
      return [...found];
    },
  };
}

function plain(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value ?? {})) as Record<string, unknown>;
}

export function isSafePlatformId(value: string): boolean {
  return ID_PATTERN.test(value);
}

function requireId(value: unknown, label: string): { ok: true; id: string } | { ok: false; error: string } {
  const id = String(value || '').trim();
  if (!isSafePlatformId(id)) return { ok: false, error: `${label} غير صالح` };
  return { ok: true, id };
}

function cleanEmail(value: unknown): string | null {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 160 || !/^[^\s@]+@[^\s@]+$/.test(email)) return null;
  return email;
}

function cleanName(value: unknown, fallback = ''): string {
  const text = String(value || fallback).trim().slice(0, 160);
  return text;
}

function feeFor(empCount: string): number {
  if (empCount === '1-10') return 50;
  if (empCount === '11-50') return 100;
  return 200;
}

async function audit(
  actor: PlatformActor,
  input: {
    action: 'create' | 'update' | 'delete' | 'customization';
    entityType: string;
    entityId: string;
    details: string;
    after?: Record<string, unknown>;
  }
): Promise<void> {
  await recordAuditEvent({
    actor: { uid: actor.uid, name: actor.email, role: actor.role },
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    after: input.after,
    ip: actor.ip,
    sessionCompanyId: actor.companyId,
    details: input.details,
  });
}

async function provisionAuth(email: string, companyName: string, companyId: string): Promise<
  { ok: true; uid: string; temporaryPassword?: string; alreadyExisted: boolean }
  | { ok: false; status: number; error: string }
> {
  if (injectedStore) {
    const issued = newTenantCredentials();
    return {
      ok: true,
      uid: `usr_${Date.now().toString(36)}`,
      temporaryPassword: issued.temporaryPassword,
      alreadyExisted: false,
    };
  }

  const { getAdminAuth } = await import('./firebaseAdmin');
  const admin = getAdminAuth();
  if (!admin) return { ok: false, status: 503, error: 'Firebase Admin is not configured' };
  const issued = newTenantCredentials();
  try {
    try {
      const existing = await admin.getUserByEmail(email);
      await admin.updateUser(existing.uid, { displayName: companyName });
      await admin.setCustomUserClaims(existing.uid, {
        role: 'COMPANY_ADMIN',
        companyId,
        mustChangePassword: false,
      });
      return { ok: true, uid: existing.uid, alreadyExisted: true };
    } catch (error: unknown) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code !== 'auth/user-not-found') throw error;
      const created = await admin.createUser({
        email,
        password: issued.temporaryPassword,
        displayName: companyName,
        emailVerified: true,
      });
      await admin.setCustomUserClaims(created.uid, {
        role: 'COMPANY_ADMIN',
        companyId,
        mustChangePassword: true,
      });
      return {
        ok: true,
        uid: created.uid,
        temporaryPassword: issued.temporaryPassword,
        alreadyExisted: false,
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'تعذر إنشاء حساب الدخول';
    return { ok: false, status: 500, error: message };
  }
}

export async function createPlatformCompany(
  actor: PlatformActor,
  input: {
    companyName?: unknown;
    requesterName?: unknown;
    email?: unknown;
    phone?: unknown;
    planType?: unknown;
    empCount?: unknown;
    initialStatus?: unknown;
  }
): Promise<PlatformResult> {
  const companyName = cleanName(input.companyName);
  if (!companyName) return { ok: false, status: 400, error: 'اسم المنشأة مطلوب' };
  const email = cleanEmail(input.email);
  if (!email) return { ok: false, status: 400, error: 'يرجى إدخال بريد إلكتروني صحيح' };
  const status = input.initialStatus === 'draft' ? 'draft' : input.initialStatus === 'approved' ? 'approved' : '';
  if (!status) return { ok: false, status: 400, error: 'حالة البداية غير صالحة' };
  const planType = cleanName(input.planType, 'medical') || 'medical';
  const empCount = cleanName(input.empCount, '11-50') || '11-50';
  const phone = cleanName(input.phone);
  const requesterName = cleanName(input.requesterName, companyName) || companyName;
  const companyId = `comp_${Date.now().toString(36)}`;
  const requestId = `req_${Date.now().toString(36)}`;
  const subscriptionId = `sub_${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const active = status === 'approved';
  const store = await openStore();

  await store.merge(`companies/${companyId}`, plain({
    companyId,
    id: companyId,
    companyName,
    nameAr: companyName,
    nameEn: companyName,
    adminEmail: email,
    email,
    phone,
    ownerName: requesterName,
    plan: planType,
    planType,
    status: active ? 'active' : 'pending',
    state: active ? 'active' : 'pending',
    isActive: active,
    createdAt: now,
    updatedAt: now,
  }));
  await store.merge(`subscriptions/${subscriptionId}`, plain({
    id: subscriptionId,
    companyId,
    companyName,
    ownerName: requesterName,
    email,
    phone,
    planType,
    subscriptionFee: feeFor(empCount),
    status: active ? 'active' : 'draft',
    startDate: now.slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
  }));
  await store.merge(`subscription_requests/${requestId}`, plain({
    id: requestId,
    companyId,
    name: companyName,
    companyName,
    requester_name: requesterName,
    requesterName,
    phone,
    email,
    plan_type: planType,
    planType,
    emp_count: empCount,
    empCount,
    state: status,
    status,
    created_at: now,
    createdAt: now,
  }));
  await audit(actor, {
    action: 'create',
    entityType: 'company',
    entityId: companyId,
    details: 'إنشاء شركة',
    after: { requestId, subscriptionId, status },
  });
  return {
    ok: true,
    status: 200,
    body: { success: true, companyId, requestId, subscriptionId, email },
  };
}

export async function createFacilityAdmin(
  actor: PlatformActor,
  input: { email?: unknown; displayName?: unknown; companyId?: unknown; companyName?: unknown; uid?: unknown }
): Promise<PlatformResult> {
  const email = cleanEmail(input.email);
  if (!email) return { ok: false, status: 400, error: 'يرجى إدخال بريد إلكتروني صحيح' };
  const company = requireId(input.companyId, 'معرّف المنشأة');
  if (!company.ok) return { ok: false, status: 400, error: company.error };
  const companyName = cleanName(input.companyName);
  const displayName = cleanName(input.displayName, companyName || email);
  const store = await openStore();
  const providedUid = String(input.uid || '').trim();
  let uid = providedUid;
  let temporaryPassword: string | undefined;
  let alreadyExisted = false;
  if (providedUid) {
    const parsed = requireId(providedUid, 'معرّف المستخدم');
    if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };
    uid = parsed.id;
  } else {
    const auth = await provisionAuth(email, displayName || companyName || email, company.id);
    if (!auth.ok) return auth;
    uid = auth.uid;
    temporaryPassword = auth.temporaryPassword;
    alreadyExisted = auth.alreadyExisted;
  }
  const now = new Date().toISOString();
  await store.merge(`users/${uid}`, plain({
    email,
    displayName: displayName || companyName || email,
    role: 'COMPANY_ADMIN',
    companyId: company.id,
    companyName,
    mustChangePassword: !alreadyExisted,
    createdAt: now,
    lastLogin: now,
  }));
  await audit(actor, {
    action: 'create',
    entityType: 'users',
    entityId: uid,
    details: 'إنشاء مسؤول منشأة',
    after: { companyId: company.id, role: 'COMPANY_ADMIN' },
  });
  return {
    ok: true,
    status: 200,
    body: {
      success: true,
      uid,
      companyId: company.id,
      alreadyExisted,
      ...(temporaryPassword ? { temporaryPassword } : {}),
    },
  };
}

async function writeRequestStatus(
  actor: PlatformActor,
  requestId: string,
  patch: Record<string, unknown>,
  details: string
): Promise<PlatformResult> {
  const parsed = requireId(requestId, 'طلب الاشتراك');
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };
  await (await openStore()).merge(`subscription_requests/${parsed.id}`, plain({ ...patch, updatedAt: new Date().toISOString() }));
  await audit(actor, {
    action: 'update',
    entityType: 'subscription_requests',
    entityId: parsed.id,
    details,
    after: patch,
  });
  return { ok: true, status: 200, body: { success: true, requestId: parsed.id } };
}

export async function approveSubscriptionRequest(
  actor: PlatformActor,
  input: {
    requestId?: unknown;
    companyId?: unknown;
    companyName?: unknown;
    requesterName?: unknown;
    email?: unknown;
    phone?: unknown;
    planType?: unknown;
  }
): Promise<PlatformResult> {
  const request = requireId(input.requestId, 'طلب الاشتراك');
  if (!request.ok) return { ok: false, status: 400, error: request.error };
  const companyName = cleanName(input.companyName);
  if (!companyName) return { ok: false, status: 400, error: 'اسم المنشأة مطلوب' };
  const email = cleanEmail(input.email);
  if (!email) return { ok: false, status: 400, error: 'يرجى إدخال بريد إلكتروني صحيح' };
  const existingCompany = String(input.companyId || '').trim();
  const companyId = existingCompany || `comp_${Date.now().toString(36)}`;
  const company = requireId(companyId, 'معرّف المنشأة');
  if (!company.ok) return { ok: false, status: 400, error: company.error };
  const requesterName = cleanName(input.requesterName, companyName);
  const planType = cleanName(input.planType, 'active') || 'active';
  const now = new Date().toISOString();
  const store = await openStore();
  await store.merge(`companies/${company.id}`, plain({
    companyId: company.id,
    id: company.id,
    companyName,
    nameAr: companyName,
    nameEn: companyName,
    adminEmail: email,
    email,
    phone: cleanName(input.phone),
    ownerName: requesterName,
    plan: planType,
    planType,
    status: 'active',
    state: 'active',
    isActive: true,
    updatedAt: now,
  }));
  await store.merge(`subscription_requests/${request.id}`, plain({
    status: 'approved',
    state: 'approved',
    companyId: company.id,
    updatedAt: now,
  }));
  await audit(actor, {
    action: 'update',
    entityType: 'subscription_requests',
    entityId: request.id,
    details: 'الموافقة على طلب الاشتراك',
    after: { status: 'approved', companyId: company.id },
  });
  return { ok: true, status: 200, body: { success: true, requestId: request.id, companyId: company.id, email } };
}

export function suspendSubscriptionRequest(actor: PlatformActor, requestId: unknown): Promise<PlatformResult> {
  const id = String(requestId || '').trim();
  return writeRequestStatus(actor, id, { status: 'suspended', state: 'suspended' }, 'تعليق طلب الاشتراك');
}

export function archiveSubscriptionRequest(actor: PlatformActor, requestId: unknown): Promise<PlatformResult> {
  const id = String(requestId || '').trim();
  return writeRequestStatus(actor, id, { archived: true }, 'أرشفة طلب الاشتراك');
}

export async function saveCustomLayout(
  actor: PlatformActor,
  input: { companyId?: unknown; screenId?: unknown; layout?: unknown }
): Promise<PlatformResult> {
  const company = requireId(input.companyId, 'معرّف المنشأة');
  if (!company.ok) return { ok: false, status: 400, error: company.error };
  const screen = requireId(input.screenId, 'الشاشة');
  if (!screen.ok) return { ok: false, status: 400, error: screen.error };
  if (!input.layout || typeof input.layout !== 'object' || Array.isArray(input.layout)) {
    return { ok: false, status: 400, error: 'التخطيط مطلوب' };
  }
  const encoded = JSON.stringify(input.layout);
  if (encoded.length > 300_000) return { ok: false, status: 400, error: 'التخطيط أكبر من الحد' };
  const now = new Date().toISOString();
  const layout = plain({
    ...(input.layout as Record<string, unknown>),
    screenId: screen.id,
    companyId: company.id,
    updatedAt: now,
    updatedBy: actor.email || actor.uid || '',
    publishedAt: now,
  });
  await (await openStore()).merge(`companies/${company.id}/custom_layouts/${screen.id}`, layout);
  await audit(actor, {
    action: 'customization',
    entityType: 'custom_layouts',
    entityId: `${company.id}/${screen.id}`,
    details: 'حفظ تخطيط الشاشة',
    after: { screenId: screen.id, companyId: company.id },
  });
  return { ok: true, status: 200, body: { success: true, companyId: company.id, screenId: screen.id, layout } };
}

export async function savePlatformUiOverrides(
  actor: PlatformActor,
  input: { companyId?: unknown; patches?: unknown }
): Promise<{ status: number; body: Record<string, unknown> }> {
  const company = requireId(input.companyId, 'معرّف المنشأة');
  if (!company.ok) return { status: 400, body: { success: false, error: company.error } };
  return saveStudioOverrides({
    role: actor.role,
    uid: actor.uid,
    email: actor.email,
    sessionCompanyId: actor.companyId,
    impersonatedCompanyId: company.id,
    patches: input.patches,
    ip: actor.ip,
  });
}

export async function resetPlatformUiOverride(
  actor: PlatformActor,
  input: { companyId?: unknown; key?: unknown }
): Promise<{ status: number; body: Record<string, unknown> }> {
  const company = requireId(input.companyId, 'معرّف المنشأة');
  if (!company.ok) return { status: 400, body: { success: false, error: company.error } };
  return resetStudioOverride({
    role: actor.role,
    uid: actor.uid,
    email: actor.email,
    sessionCompanyId: actor.companyId,
    impersonatedCompanyId: company.id,
    key: input.key,
    ip: actor.ip,
  });
}

export async function deleteCompliance(
  actor: PlatformActor,
  input: { companyId?: unknown; docId?: unknown }
): Promise<PlatformResult> {
  const company = requireId(input.companyId, 'معرّف المنشأة');
  if (!company.ok) return { ok: false, status: 400, error: company.error };
  const store = await openStore();
  const collectionPath = `companies/${company.id}/compliance`;
  const explicit = String(input.docId || '').trim();
  const paths = explicit
    ? (() => {
        const doc = requireId(explicit, 'مستند الامتثال');
        return doc.ok ? [`${collectionPath}/${doc.id}`] : null;
      })()
    : await store.list(collectionPath);
  if (!paths) return { ok: false, status: 400, error: 'مستند الامتثال غير صالح' };
  for (const path of paths) await store.remove(path);
  await audit(actor, {
    action: 'delete',
    entityType: 'compliance',
    entityId: company.id,
    details: 'حذف compliance',
    after: { removed: paths.length },
  });
  return { ok: true, status: 200, body: { success: true, removed: paths.length } };
}

export async function deleteSystemConfig(
  actor: PlatformActor,
  input: { companyId?: unknown; docId?: unknown }
): Promise<PlatformResult> {
  const explicit = String(input.docId || '').trim();
  const companyRaw = String(input.companyId || '').trim();
  let docIds: string[] = [];
  if (explicit) {
    const doc = requireId(explicit, 'system_config');
    if (!doc.ok) return { ok: false, status: 400, error: doc.error };
    docIds = [doc.id];
  } else if (companyRaw) {
    const company = requireId(companyRaw, 'معرّف المنشأة');
    if (!company.ok) return { ok: false, status: 400, error: company.error };
    docIds = TENANT_SYSTEM_CONFIG_PREFIXES.map((prefix) => `${prefix}${company.id}`);
  } else {
    return { ok: false, status: 400, error: 'حدد المنشأة أو المستند' };
  }
  const store = await openStore();
  for (const docId of docIds) await store.remove(`system_config/${docId}`);
  await audit(actor, {
    action: 'delete',
    entityType: 'system_config',
    entityId: companyRaw || explicit,
    details: 'حذف system_config',
    after: { documents: docIds },
  });
  return { ok: true, status: 200, body: { success: true, removed: docIds.length } };
}

const PUBLIC_KEY_FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
const SECRET_FIELDS = new Set([
  'password',
  'adminPassword',
  'temporaryPassword',
  'geminiApiKey',
  'private_key',
  'privateKey',
  'serviceAccount',
]);
const RESTORE_LIMIT = 500;
const PURGE_ID_LIMIT = 30;
const OPERATIONAL_COLLECTIONS = [
  'employees',
  'leave_requests',
  'leave_allocations',
  'attendance',
  'payslips',
  'contracts',
  'documents',
  'custodies',
  'loans',
  'warnings',
  'employeeNotes',
  'notifications',
  'departments',
  'job_titles',
  'users',
] as const;
const PRIMARY_COLLECTIONS = [
  'companies',
  'subscriptions',
  'subscription_requests',
  'settings',
  'company_settings',
] as const;

function boundedText(value: unknown, max = 200): string {
  return String(value ?? '').trim().slice(0, max);
}

function stripSecrets(data: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SECRET_FIELDS.has(key)) continue;
    next[key] = value;
  }
  return next;
}

function publicKeys(data: Record<string, unknown> | null): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of PUBLIC_KEY_FIELDS) next[field] = boundedText(data?.[field]);
  return next;
}

export async function readSystemKeys(): Promise<PlatformResult> {
  const stored = await (await openStore()).read('system_config/keys');
  return { ok: true, status: 200, body: { success: true, ...publicKeys(stored) } };
}

export async function savePlatformSystemKeys(
  actor: PlatformActor,
  input: Record<string, unknown>
): Promise<PlatformResult> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, status: 400, error: 'إعدادات المفاتيح مطلوبة' };
  }
  const payload = plain({
    ...publicKeys(input),
    geminiApiKey: '',
    updatedAt: new Date().toISOString(),
    updatedBy: actor.email || actor.uid || '',
  });
  await (await openStore()).merge('system_config/keys', payload);
  await audit(actor, {
    action: 'update',
    entityType: 'system_config',
    entityId: 'keys',
    details: 'حفظ مفاتيح النظام',
    after: { projectId: payload.projectId },
  });
  return { ok: true, status: 200, body: { success: true } };
}

function restoreRows(
  value: unknown,
  label: string
): { ok: true; rows: Array<{ id: string; data: Record<string, unknown> }> } | { ok: false; error: string } {
  if (value == null) return { ok: true, rows: [] };
  if (!Array.isArray(value)) return { ok: false, error: `${label} يجب أن تكون قائمة` };
  if (value.length > RESTORE_LIMIT) return { ok: false, error: `${label} تتجاوز حد الاستعادة` };
  const rows: Array<{ id: string; data: Record<string, unknown> }> = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: `${label} تحتوي صفاً غير صالح` };
    }
    const record = item as Record<string, unknown>;
    const parsed = requireId(record.id, label);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const encoded = JSON.stringify(record);
    if (encoded.length > 100_000) return { ok: false, error: `${label} تحتوي صفاً أكبر من الحد` };
    rows.push({ id: parsed.id, data: stripSecrets(plain(record)) });
  }
  return { ok: true, rows };
}

export async function restorePlatformBackup(
  actor: PlatformActor,
  input: { companies?: unknown; subscriptions?: unknown }
): Promise<PlatformResult> {
  const companies = restoreRows(input.companies, 'الشركات');
  if (!companies.ok) return { ok: false, status: 400, error: companies.error };
  const requests = restoreRows(input.subscriptions, 'طلبات الاشتراك');
  if (!requests.ok) return { ok: false, status: 400, error: requests.error };
  if (!companies.rows.length && !requests.rows.length) {
    return { ok: false, status: 400, error: 'النسخة فارغة' };
  }
  const store = await openStore();
  for (const row of companies.rows) await store.merge(`companies/${row.id}`, row.data);
  for (const row of requests.rows) await store.merge(`subscription_requests/${row.id}`, row.data);
  await audit(actor, {
    action: 'update',
    entityType: 'backup',
    entityId: 'restore',
    details: 'استعادة نسخة احتياطية',
    after: { companies: companies.rows.length, subscriptionRequests: requests.rows.length },
  });
  return {
    ok: true,
    status: 200,
    body: {
      success: true,
      companies: companies.rows.length,
      subscriptionRequests: requests.rows.length,
    },
  };
}

function purgedDocKey(token: string): string | null {
  const key = token.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/_+/g, '_').slice(0, 120);
  return isSafePlatformId(key) ? key : null;
}

async function rememberLinkedIds(store: PlatformDocStore, ids: Set<string>, path: string): Promise<void> {
  const data = await store.read(path);
  const linked = String(data?.companyId || '').trim();
  if (linked && isSafePlatformId(linked)) ids.add(linked);
  const docId = path.slice(path.lastIndexOf('/') + 1);
  if (data && isSafePlatformId(docId)) ids.add(docId);
}

export async function purgePlatformTenant(
  actor: PlatformActor,
  input: { id?: unknown; companyId?: unknown; email?: unknown; name?: unknown; phone?: unknown }
): Promise<PlatformResult> {
  const ids = new Set<string>();
  for (const value of [input.id, input.companyId]) {
    const raw = String(value || '').trim();
    if (!raw) continue;
    const parsed = requireId(raw, 'معرّف المنشأة');
    if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };
    ids.add(parsed.id);
  }
  if (!ids.size) return { ok: false, status: 400, error: 'معرّف المنشأة مطلوب' };
  const emailRaw = String(input.email || '').trim();
  const email = emailRaw ? cleanEmail(emailRaw) : null;
  if (emailRaw && !email) return { ok: false, status: 400, error: 'البريد الإلكتروني غير صالح' };

  const store = await openStore();
  for (const id of [...ids]) {
    await rememberLinkedIds(store, ids, `companies/${id}`);
    await rememberLinkedIds(store, ids, `subscription_requests/${id}`);
    await rememberLinkedIds(store, ids, `subscriptions/${id}`);
  }
  for (const path of await store.whereIn('companies', 'companyId', [...ids])) {
    await rememberLinkedIds(store, ids, path);
  }
  if (ids.size > PURGE_ID_LIMIT) return { ok: false, status: 400, error: 'نطاق الحذف أكبر من الحد' };

  const idList = [...ids];
  const removed = new Set<string>();
  const deletedCounts: Record<string, number> = { authUsers: 0 };
  const removePath = async (path: string, bucket: string) => {
    if (removed.has(path)) return;
    if (path.startsWith('users/') && actor.uid && path === `users/${actor.uid}`) return;
    const existing = await store.read(path);
    if (!existing) return;
    await store.remove(path);
    removed.add(path);
    deletedCounts[bucket] = (deletedCounts[bucket] || 0) + 1;
  };

  for (const collectionName of OPERATIONAL_COLLECTIONS) {
    for (const path of await store.whereIn(collectionName, 'companyId', idList)) {
      await removePath(path, collectionName);
    }
  }
  for (const collectionName of PRIMARY_COLLECTIONS) {
    for (const id of idList) await removePath(`${collectionName}/${id}`, collectionName);
    for (const path of await store.whereIn(collectionName, 'companyId', idList)) {
      await removePath(path, collectionName);
    }
  }

  const now = new Date().toISOString();
  const tokens = [input.id, input.companyId, input.name, email, input.phone].map((value) => String(value || '').trim()).filter(Boolean);
  for (const token of tokens) {
    const key = purgedDocKey(token);
    if (!key) continue;
    await store.merge(`purged_tenants/${key}`, plain({ token, purgedAt: now }));
  }

  if (email && !injectedStore) {
    const { getAdminAuth } = await import('./firebaseAdmin');
    const admin = getAdminAuth();
    if (admin) {
      try {
        const user = await admin.getUserByEmail(email);
        await admin.deleteUser(user.uid);
        deletedCounts.authUsers += 1;
      } catch (error: unknown) {
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code !== 'auth/user-not-found') throw error;
      }
    }
  }

  const name = cleanName(input.name);
  await audit(actor, {
    action: 'delete',
    entityType: 'tenant',
    entityId: idList[0],
    details: 'حذف متتالي لمنشأة',
    after: { removed: removed.size, collections: deletedCounts },
  });
  return {
    ok: true,
    status: 200,
    body: {
      success: true,
      ids: idList,
      deletedCounts,
      message: name
        ? `تم حذف منشأة (${name}) وكافة بياناتها وحساب الدخول نهائياً`
        : 'تم حذف المنشأة وكافة بياناتها وحساب الدخول نهائياً',
    },
  };
}
