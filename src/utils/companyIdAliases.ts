/**
 * Legacy companyId values accepted by production canonicalTenantCompanyId.
 * Field updates use this map. Document ids are reported and left in place.
 */
export const COMPANY_ID_ALIASES: Record<string, string> = {
  'comp-alfanar': 'tenant_1788413304890',
  'comp-elite': 'comp-1788435917695',
  'comp-1788142584811': 'comp-1788442584841',
  '1788142584811': 'comp-1788442584841',
  '1788442584841': 'comp-1788442584841',
  'tenant_1788442584841': 'comp-1788442584841',
  'comp-manar': 'comp-1788442584841',
  'comp-almanar': 'comp-1788442584841',
};

export const COMPANY_ID_FIELDS = ['companyId', 'company_id', 'activeCompanyId'] as const;

const DOC_ID_PREFIXES = [
  'leave_policy_',
  'attendance_policy_',
  'public_holidays_',
  'attendance_shift_seed_rules_',
  'facility_licensing_',
];

export type CompanyIdFieldHit = {
  path: string;
  field: (typeof COMPANY_ID_FIELDS)[number];
  from: string;
  to: string;
};

export type LegacyDocumentIdHit = {
  path: string;
  from: string;
  to: string;
};

export function canonicalCompanyId(raw: string): string {
  const id = raw.trim();
  return COMPANY_ID_ALIASES[id] || id;
}

export function planCompanyIdFieldUpdates(
  path: string,
  data: Record<string, unknown> | undefined | null
): CompanyIdFieldHit[] {
  if (!data) return [];
  const hits: CompanyIdFieldHit[] = [];
  for (const field of COMPANY_ID_FIELDS) {
    const raw = data[field];
    if (typeof raw !== 'string') continue;
    const from = raw.trim();
    const to = COMPANY_ID_ALIASES[from];
    if (!to || to === from) continue;
    hits.push({ path, field, from, to });
  }
  return hits;
}

export function planLegacyDocumentId(path: string, docId: string): LegacyDocumentIdHit | null {
  const direct = COMPANY_ID_ALIASES[docId];
  if (direct && direct !== docId) {
    return { path, from: docId, to: direct };
  }
  for (const prefix of DOC_ID_PREFIXES) {
    if (!docId.startsWith(prefix)) continue;
    const raw = docId.slice(prefix.length);
    const to = COMPANY_ID_ALIASES[raw];
    if (to && to !== raw) {
      return { path, from: docId, to: `${prefix}${to}` };
    }
  }
  return null;
}
