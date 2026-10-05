/**
 * Company id used for Studio ui_overrides — must match the tenant being viewed.
 */
export function resolveStudioCompanyId(input: {
  activeCompanyId?: string | null;
  activeCompanyDocId?: string | null;
  impersonatingCompanyId?: string | null;
  authCompanyId?: string | null;
}): string {
  const normalize = (id?: string | null) => {
    const v = String(id || '').trim();
    if (!v || v === 'SAAS_PLATFORM') return '';
    return v;
  };

  const fromImpersonation = normalize(input.impersonatingCompanyId);
  if (fromImpersonation) return fromImpersonation;

  const fromActive = normalize(input.activeCompanyId);
  if (fromActive && fromActive !== 'comp-super-admin') return fromActive;

  const fromDoc = normalize(input.activeCompanyDocId);
  if (fromDoc && fromDoc !== 'comp-super-admin') return fromDoc;

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlId = normalize(params.get('companyId') || params.get('company_id'));
    if (urlId) return urlId;
  }

  const fromAuth = normalize(input.authCompanyId);
  if (fromAuth) return fromAuth;

  return '';
}
