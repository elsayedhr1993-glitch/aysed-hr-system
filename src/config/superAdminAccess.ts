/** Platform owners — must match server auth and launcher UI. */
export const SUPER_ADMIN_EMAILS = ['admin@aysed.com', 'elsayedhr1993@gmail.com'] as const;

export function normalizeAuthEmail(email: string | undefined | null): string {
  return String(email || '').trim().toLowerCase();
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  const normalized = normalizeAuthEmail(email);
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export function isSuperAdminPrincipal(input: {
  role?: string | null;
  email?: string | null;
}): boolean {
  if (String(input.role || '').toUpperCase() === 'SUPER_ADMIN') return true;
  return isSuperAdminEmail(input.email);
}
