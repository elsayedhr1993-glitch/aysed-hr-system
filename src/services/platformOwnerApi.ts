import { buildAuthedJsonHeaders } from '../lib/clientAuth';

async function platformRequest(
  path: string,
  method: 'POST' | 'PUT' | 'GET',
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const headers = await buildAuthedJsonHeaders();
  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'رفض الخادم العملية');
  }
  return payload as Record<string, unknown>;
}

export async function createPlatformCompany(input: {
  companyName: string;
  requesterName: string;
  email: string;
  phone: string;
  planType: string;
  empCount: string;
  initialStatus: 'approved' | 'draft';
}): Promise<{ companyId: string; requestId: string; email: string }> {
  const payload = await platformRequest('/api/platform/companies', 'POST', input);
  const companyId = String(payload.companyId || '');
  const requestId = String(payload.requestId || '');
  if (!companyId || !requestId) throw new Error('الخادم لم يعُد معرّف المنشأة');
  return { companyId, requestId, email: String(payload.email || input.email) };
}

export async function createFacilityAdmin(input: {
  email: string;
  displayName: string;
  companyId: string;
  companyName: string;
  uid?: string;
}): Promise<{ uid: string; temporaryPassword: string; alreadyExisted: boolean }> {
  const payload = await platformRequest('/api/platform/facility-admins', 'POST', input);
  return {
    uid: String(payload.uid || ''),
    temporaryPassword: String(payload.temporaryPassword || ''),
    alreadyExisted: payload.alreadyExisted === true,
  };
}

export async function approveSubscriptionRequest(input: {
  requestId: string;
  companyId?: string;
  companyName: string;
  requesterName: string;
  email: string;
  phone: string;
  planType: string;
}): Promise<{ companyId: string; email: string }> {
  const payload = await platformRequest('/api/platform/subscription-requests/approve', 'POST', input);
  return { companyId: String(payload.companyId || ''), email: String(payload.email || input.email) };
}

export async function suspendSubscriptionRequest(requestId: string): Promise<void> {
  await platformRequest('/api/platform/subscription-requests/suspend', 'POST', { requestId });
}

export async function archiveSubscriptionRequest(requestId: string): Promise<void> {
  await platformRequest('/api/platform/subscription-requests/archive', 'POST', { requestId });
}

export async function updatePlatformSubscriptionRequest(input: {
  rowId: string;
  companyId: string;
  companyName: string;
  requesterName: string;
  phone: string;
  email: string;
  planType: string;
  empCount: string;
  state: string;
}): Promise<{ requestId: string; companyId: string }> {
  const payload = await platformRequest('/api/platform/subscription-requests/update', 'POST', { ...input });
  return {
    requestId: String(payload.requestId || ''),
    companyId: String(payload.companyId || ''),
  };
}

export async function listPlatformSubscriptionRequests(): Promise<Array<Record<string, unknown> & { id: string }>> {
  const payload = await platformRequest('/api/platform/subscription-requests', 'GET');
  const rows = Array.isArray(payload.requests) ? payload.requests : [];
  return rows.map((row) => {
    const data = row && typeof row === 'object' ? row as Record<string, unknown> : {};
    return { ...data, id: String(data.id || '') };
  });
}

export async function upsertPlatformFacilityUsers(input: {
  companyId: string;
  email: string;
  uid?: string;
  previousEmails?: string[];
  displayName?: string;
  companyName?: string;
  isActive?: boolean;
  status?: string;
}): Promise<number> {
  const payload = await platformRequest('/api/platform/facility-users', 'POST', { ...input });
  return Number(payload.updated || 0);
}

export async function savePlatformPamForm(input: {
  pamOverlayCoords: Record<string, unknown>;
  pamFontChoice?: string;
  pamOverlaySchemaVersion?: number;
}): Promise<void> {
  await platformRequest('/api/platform/pam-form', 'POST', { ...input });
}

export async function savePlatformCustomLayout(input: {
  companyId: string;
  screenId: string;
  layout: Record<string, unknown>;
}): Promise<void> {
  await platformRequest('/api/platform/custom-layouts', 'PUT', input);
}

export async function deletePlatformCompliance(companyId: string): Promise<void> {
  await platformRequest('/api/platform/compliance/delete', 'POST', { companyId });
}

export async function deletePlatformSystemConfig(companyId: string): Promise<void> {
  await platformRequest('/api/platform/system-config/delete', 'POST', { companyId });
}

export interface PlatformSystemKeys {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export async function loadPlatformSystemKeys(): Promise<PlatformSystemKeys> {
  const payload = await platformRequest('/api/platform/system-config/keys', 'GET');
  return {
    apiKey: String(payload.apiKey || ''),
    authDomain: String(payload.authDomain || ''),
    projectId: String(payload.projectId || ''),
    storageBucket: String(payload.storageBucket || ''),
    messagingSenderId: String(payload.messagingSenderId || ''),
    appId: String(payload.appId || ''),
  };
}

export async function savePlatformSystemKeys(input: PlatformSystemKeys): Promise<void> {
  await platformRequest('/api/platform/system-config/keys', 'POST', { ...input });
}

export async function restorePlatformBackup(input: {
  companies?: unknown[];
  subscriptions?: unknown[];
}): Promise<void> {
  await platformRequest('/api/platform/backup/restore', 'POST', {
    companies: input.companies || [],
    subscriptions: input.subscriptions || [],
  });
}

export async function purgePlatformTenant(input: {
  id: string;
  companyId?: string;
  email?: string;
  name?: string;
  phone?: string;
}): Promise<{ message: string; ids: string[]; deletedCounts: Record<string, number> }> {
  const payload = await platformRequest('/api/platform/tenants/purge', 'POST', { ...input });
  const ids = Array.isArray(payload.ids) ? payload.ids.map((id) => String(id)) : [];
  const deletedCounts = payload.deletedCounts && typeof payload.deletedCounts === 'object'
    ? payload.deletedCounts as Record<string, number>
    : {};
  return {
    message: String(payload.message || ''),
    ids,
    deletedCounts,
  };
}
