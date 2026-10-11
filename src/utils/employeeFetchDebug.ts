/** Enable via localStorage: aysed_employee_debug=1 */
export function isEmployeeFetchDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem('aysed_employee_debug') === '1';
  } catch {
    return false;
  }
}

/** Names to highlight in Firestore directory diagnostics (e.g. المنار كلينك) */
export const EMPLOYEE_DIRECTORY_WATCH_NAME_FRAGMENTS = [
  'آصف',
  'asif',
  'asef',
  'aasef',
  'ديفيكا',
  'devika',
];

export function findWatchedEmployeesInFetch(
  rows: Array<{ id: string; data: Record<string, unknown> }>
): Array<{ id: string; fullNameAr?: string; companyId?: unknown }> {
  return rows
    .filter((row) => {
      const blob = `${row.data.fullNameAr || ''} ${row.data.fullNameEn || ''} ${row.data.nameAr || ''} ${row.data.nameEn || ''}`.toLowerCase();
      return EMPLOYEE_DIRECTORY_WATCH_NAME_FRAGMENTS.some((frag) => blob.includes(frag.toLowerCase()));
    })
    .map((row) => ({
      id: row.id,
      fullNameAr: row.data.fullNameAr as string | undefined,
      companyId: row.data.companyId ?? row.data.company_id,
    }));
}

/** Console summary after each merged Firestore employee fetch (no query limit applied). */
export function logFirestoreEmployeeFetchSummary(
  companyId: string,
  rows: Array<{ id: string; data: Record<string, unknown> }>,
  extra?: Record<string, unknown>
): void {
  if (!isEmployeeFetchDebugEnabled()) return;
  const watchHits = findWatchedEmployeesInFetch(rows);
  console.log('[Aysed HR · Employees · Firestore fetch]', {
    companyId,
    totalEmployeesFromFirestore: rows.length,
    watchNameMatches: watchHits,
    noClientLimitApplied: true,
    ...extra,
  });
}

export function logEmployeeFetchPipeline(
  source: string,
  payload: {
    firestoreRawCount?: number;
    afterMapCount?: number;
    afterTenantFilterCount?: number;
    afterUiFilterCount?: number;
    droppedByMap?: number;
    droppedByTenant?: number;
    companyId?: string;
    extra?: Record<string, unknown>;
  }
): void {
  if (!isEmployeeFetchDebugEnabled()) return;
  console.log(`[Aysed HR · Employees · ${source}]`, {
    ...payload,
    at: new Date().toISOString(),
  });
}
