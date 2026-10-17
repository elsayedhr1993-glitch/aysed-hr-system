import { buildAuthedJsonHeaders } from '../lib/clientAuth';

async function platformRequest(
  path: string,
  method: 'POST' | 'PUT',
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const headers = await buildAuthedJsonHeaders();
  const response = await fetch(path, {
    method,
    headers,
    body: JSON.stringify(body),
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
