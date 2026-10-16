import { canReadPayroll } from '../../security/accessRoles';

export const PAYROLL_REPORT_IDS = ['wps_reconciliation', 'eos_indemnity_accrual'] as const;

export function isPayrollReport(id: string): boolean {
  return (PAYROLL_REPORT_IDS as readonly string[]).includes(id);
}

/** The server session role is the only input. The client does not decide. */
export function payrollReportsAllowed(role: string | undefined | null): boolean {
  return canReadPayroll(role);
}

export function visibleReportIds(ids: readonly string[], payrollAllowed: boolean): string[] {
  return ids.filter((id) => payrollAllowed || !isPayrollReport(id));
}

export function reportMonthOptions(now = new Date(), count = 18): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let index = 0; index < count; index += 1) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: value });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return options;
}
