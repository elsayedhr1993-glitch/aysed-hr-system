import { normalizeContractStatus } from './contractStatus';

/** Legacy slugs → canonical Firestore companyId */
const TENANT_ID_ALIASES: Record<string, string> = {
  'comp-alfanar': 'tenant_1788413304890',
  'comp-elite': 'comp-1788435917695',
};

export function normalizeTenantCompanyId(companyId?: string | null): string {
  const id = String(companyId || '').trim();
  if (!id) return '';
  return TENANT_ID_ALIASES[id] || id;
}

export function tenantCompanyIdsMatch(a?: string | null, b?: string | null): boolean {
  const na = normalizeTenantCompanyId(a);
  const nb = normalizeTenantCompanyId(b);
  return Boolean(na && nb && na === nb);
}

/** All companyId values that may appear on contract docs for this tenant session */
export function contractQueryCompanyIds(activeCompanyId: string): string[] {
  const canonical = normalizeTenantCompanyId(activeCompanyId);
  const ids = new Set<string>([String(activeCompanyId || '').trim(), canonical].filter(Boolean));
  if (canonical === 'tenant_1788413304890') ids.add('comp-alfanar');
  if (canonical === 'comp-1788435917695') ids.add('comp-elite');
  return [...ids];
}

export function canonicalContractDocId(companyId: string, employeeId: string): string {
  const comp = normalizeTenantCompanyId(companyId);
  const emp = String(employeeId || '').trim();
  return `contract-${comp}-${emp}`;
}

export function readEmployeeCompanyId(employee?: Record<string, unknown> | null): string {
  if (!employee) return '';
  const raw = String(employee.companyId || employee.company_id || '').trim();
  return normalizeTenantCompanyId(raw);
}

export function employeeBelongsToTenant(
  employee?: Record<string, unknown> | null,
  targetCompanyId?: string | null
): boolean {
  const empCo = readEmployeeCompanyId(employee);
  if (!empCo || !targetCompanyId) return false;
  return tenantCompanyIdsMatch(empCo, targetCompanyId);
}

export function canAutoMaterializeContractForEmployee(
  employee?: Record<string, unknown> | null,
  targetCompanyId?: string | null
): boolean {
  return employeeBelongsToTenant(employee, targetCompanyId);
}

export interface TenantContractRecord {
  id?: string;
  contractRef?: string;
  employeeId?: string;
  contractStatus?: string;
  status?: string;
}

function contractStatusRank(status: unknown): number {
  const s = normalizeContractStatus(String(status || ''));
  if (s === 'running') return 3;
  if (s === 'draft') return 2;
  return 1;
}

export function resolveEmployeeKeyFromContract(
  docId: string,
  companyId: string,
  data?: Record<string, unknown> | null
): string {
  const explicit = String(data?.employeeId || '').trim();
  if (explicit) return explicit;
  const prefix = `contract-${normalizeTenantCompanyId(companyId)}-`;
  if (docId.startsWith(prefix)) return docId.slice(prefix.length);
  const legacyPrefix = `contract-${companyId}-`;
  if (docId.startsWith(legacyPrefix)) return docId.slice(legacyPrefix.length);
  return '';
}

export function employeeHasContractRecord(
  employeeId: string,
  companyId: string,
  contractRows: TenantContractRecord[]
): boolean {
  const canonicalRef = canonicalContractDocId(companyId, employeeId);
  const normalizedCo = normalizeTenantCompanyId(companyId);
  return contractRows.some((c) => {
    const ref = String(c.contractRef || c.id || '');
    return (
      c.id === employeeId ||
      c.employeeId === employeeId ||
      ref === canonicalRef ||
      ref === `contract-${companyId}-${employeeId}` ||
      ref === `contract-${normalizedCo}-${employeeId}` ||
      ref.endsWith(`-${employeeId}`)
    );
  });
}

function employeeKeyForContractRow(row: TenantContractRecord, companyId: string): string {
  const explicit = String(row.employeeId || '').trim();
  if (explicit) return explicit;
  const ref = String(row.contractRef || row.id || '');
  const fromRef = resolveEmployeeKeyFromContract(ref, companyId, row as Record<string, unknown>);
  if (fromRef) return fromRef;
  return String(row.id || '').trim();
}

/** One contract per employee per tenant (UI + API lists). */
export function dedupeTenantContracts<T extends TenantContractRecord>(
  rows: T[],
  companyId: string
): T[] {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const key = employeeKeyForContractRow(row, companyId);
    if (!key) continue;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  const out: T[] = [];
  for (const group of groups.values()) {
    const best = group.reduce((a, b) => {
      const ra = contractStatusRank(a.contractStatus || a.status);
      const rb = contractStatusRank(b.contractStatus || b.status);
      if (rb !== ra) return rb > ra ? b : a;
      const refA = String(a.contractRef || a.id || '');
      const refB = String(b.contractRef || b.id || '');
      const canonicalA = refA.startsWith('contract-') ? 1 : 0;
      const canonicalB = refB.startsWith('contract-') ? 1 : 0;
      if (canonicalB !== canonicalA) return canonicalB > canonicalA ? b : a;
      return refB.localeCompare(refA) > 0 ? b : a;
    });
    const key = employeeKeyForContractRow(best, companyId);
    out.push({ ...best, id: key, employeeId: best.employeeId || key });
  }
  return out;
}
