import { buildAuthedJsonHeaders } from '../lib/clientAuth';

async function tenantRequest(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const headers = await buildAuthedJsonHeaders();
  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'رفض الخادم العملية');
  }
  return payload as Record<string, unknown>;
}

/** Company id comes from the session. A company id in the patch is ignored by the server. */
export async function mergeSessionCompanyProfile(patch: Record<string, unknown>): Promise<void> {
  const { companyId: _companyId, company_id: _alias, id: _id, role: _role, ...fields } = patch;
  await tenantRequest('/api/tenant/company-profile', { patch: fields });
}

export async function saveSessionIntegrations(input: {
  publicVerificationDomain: string;
  branches: unknown[];
  whatsAppGateway: Record<string, unknown>;
  geminiApiKey?: string;
}): Promise<{ tokenStored: boolean }> {
  const payload = await tenantRequest('/api/tenant/system-integrations', {
    publicVerificationDomain: input.publicVerificationDomain,
    branches: input.branches,
    whatsAppGateway: input.whatsAppGateway,
    ...(input.geminiApiKey ? { geminiApiKey: input.geminiApiKey } : {}),
  });
  return { tokenStored: payload.tokenStored === true };
}
