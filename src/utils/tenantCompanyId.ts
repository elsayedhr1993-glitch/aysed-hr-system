const NON_TENANT_COMPANY_IDS = new Set([
  '',
  'SAAS_PLATFORM',
  'comp-super-admin',
  'all',
]);

export function isQueryableTenantCompanyId(companyId?: string | null): boolean {
  const id = String(companyId ?? '').trim();
  return id.length > 0 && !NON_TENANT_COMPANY_IDS.has(id);
}

export function readCompanyIdFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return (params.get('companyId') || params.get('company_id') || '').trim();
}

/**
 * Canonical tenant company id for Firestore queries (aligns App, Documents, Odoo modules).
 */
export function resolveTenantCompanyId(
  companyContextId?: string | null,
  fallbackCompanyId?: string | null,
  urlCompanyId?: string | null
): string | undefined {
  const fromUrl = String(urlCompanyId ?? readCompanyIdFromUrl()).trim();
  const fromContext = String(companyContextId ?? '').trim();
  const fallback = String(fallbackCompanyId ?? '').trim();

  if (isQueryableTenantCompanyId(fromContext)) return fromContext;
  if (isQueryableTenantCompanyId(fallback)) return fallback;
  if (isQueryableTenantCompanyId(fromUrl)) return fromUrl;
  return undefined;
}
