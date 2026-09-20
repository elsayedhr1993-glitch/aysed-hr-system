/** Resolve display name across employee schema variants (Odoo / legacy fields). */
export function resolveEmployeeDisplayName(
  employee?: Record<string, unknown> | null,
  locale: 'ar' | 'en' = 'ar'
): string {
  if (!employee) return '';
  const ar = String(employee.nameAr || employee.fullNameAr || employee.name || '').trim();
  const en = String(employee.nameEn || employee.fullNameEn || '').trim();
  if (locale === 'en' && en) return en;
  return ar || en;
}

export function employeeMatchesSearchQuery(
  employee: Record<string, unknown> | null | undefined,
  query: string
): boolean {
  if (!query.trim() || !employee) return false;
  const q = query.toLowerCase();
  const fields = [
    employee.nameAr,
    employee.fullNameAr,
    employee.name,
    employee.fullNameEn,
    employee.nameEn,
  ];
  return fields.some(value => value && String(value).toLowerCase().includes(q));
}
