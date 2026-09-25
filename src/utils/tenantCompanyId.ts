/**
 * Canonical tenant company id for Firestore queries (aligns App, Documents, Odoo modules).
 * Prefer CompanyContext active id; fall back to legacy activeCompany record.
 */
export function resolveTenantCompanyId(
  companyContextId?: string | null,
  fallbackCompanyId?: string | null
): string | undefined {
  const fromContext = String(companyContextId ?? '').trim();
  if (fromContext && fromContext !== 'SAAS_PLATFORM') {
    return fromContext;
  }
  const fallback = String(fallbackCompanyId ?? '').trim();
  return fallback || undefined;
}
