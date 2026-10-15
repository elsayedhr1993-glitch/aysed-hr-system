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

import { normalizeTenantCompanyId } from './contractTenantRules';

export function readCompanyIdFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('companyId') || params.get('company_id') || '').trim();
  if (!raw) return '';
  const normalized = normalizeTenantCompanyId(raw);
  return normalized || raw;
}

/**
 * Canonical tenant company id for Firestore queries (aligns App, Documents, Odoo modules).
 */
/** Fix bookmarked ?companyId= typos (e.g. المنار 81 vs 84) without reload. */
export function rewriteCanonicalCompanyIdInUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('companyId') || params.get('company_id') || '').trim();
  if (!raw) return;
  const normalized = normalizeTenantCompanyId(raw);
  if (!normalized || normalized === raw) return;
  params.set('companyId', normalized);
  params.delete('company_id');
  const qs = params.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}

/**
 * Display hint for the platform-admin facility picker.
 * A query value never becomes the active tenant.
 */
export function companyPickerHintFromQuery(
  sessionVerified: boolean,
  platformAdmin: boolean,
  queryCompanyId: string
): string {
  if (!sessionVerified || !platformAdmin) return '';
  const raw = String(queryCompanyId || '').trim();
  if (!raw) return '';
  return normalizeTenantCompanyId(raw) || raw;
}

export function readAdminCompanyPickerHint(sessionVerified: boolean, platformAdmin: boolean): string {
  if (!sessionVerified || !platformAdmin || typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('companyId') || params.get('company_id') || '').trim();
  return companyPickerHintFromQuery(true, true, raw);
}

export function resolveTenantCompanyId(
  companyContextId?: string | null,
  fallbackCompanyId?: string | null,
  _urlCompanyId?: string | null
): string | undefined {
  const fromContext = String(companyContextId ?? '').trim();
  const fallback = String(fallbackCompanyId ?? '').trim();

  if (isQueryableTenantCompanyId(fromContext)) return fromContext;
  if (isQueryableTenantCompanyId(fallback)) return fallback;
  return undefined;
}
