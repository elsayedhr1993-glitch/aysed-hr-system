export function resolveEmployeeAvatarUrl(emp: Record<string, unknown>): string | null {
  const raw =
    emp.avatarUrl ??
    emp.avatar ??
    emp.photoUrl ??
    emp.image ??
    emp.profileImage ??
    emp.profilePhoto ??
    (emp.raw_payload as Record<string, unknown> | undefined)?.avatarUrl ??
    (emp.raw_payload as Record<string, unknown> | undefined)?.avatar;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  return trimmed;
}
