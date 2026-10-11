/** Enable via localStorage: aysed_employee_debug=1 */
export function isEmployeeFetchDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem('aysed_employee_debug') === '1';
  } catch {
    return false;
  }
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
