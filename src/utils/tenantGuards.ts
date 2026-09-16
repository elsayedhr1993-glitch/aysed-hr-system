export function requireCompanyId(companyId?: string | null): string {
  const normalized = String(companyId || '').trim();
  if (!normalized) {
    throw new Error('Missing required companyId for strict tenant-scoped operation.');
  }
  return normalized;
}