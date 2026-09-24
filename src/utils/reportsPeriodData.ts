/** Shared helpers for Reports & Analytics (period payslips + monthly attendance rollup). */

export const REPORTS_MISSING = 'غير متوفر';

export interface MonthlyAttendanceRollupEntry {
  employeeId: string;
  lateMinutes: number;
  unexcusedAbsenceDays: number;
  overtimeHours: number;
  overtimePay: number;
  delayDeduction: number;
  absenceDeduction: number;
  actualHours: number;
}

export interface ReportsPayslipSnapshot {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  absenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  loanDeduction: number;
  grossSalary: number;
  netSalary: number;
  status: 'draft' | 'review' | 'confirmed' | 'paid' | string;
  wpsFileRef?: string;
  bankName?: string;
  iban?: string;
}

export type ReportsComplianceStatus =
  | 'ساري ومطابق'
  | 'ينتهي قريباً (<30 يوم)'
  | 'منتهي الصلاحية'
  | 'بيانات ناقصة';

export type ReportsWpsStatus = 'مطابق ومحوّل' | 'قيد المراجعة' | 'فروقات غير مسواة';

export function isActiveReportEmployee(emp: Record<string, unknown>): boolean {
  const st = String(emp.status || '').toUpperCase();
  const cst = String(emp.contractStatus || '').toLowerCase();
  if (['TERMINATED', 'RESIGNED'].includes(st)) return false;
  if (['مستقيل', 'منتهي'].includes(String(emp.status || ''))) return false;
  if (cst === 'expired' || cst === 'cancelled') return false;
  return true;
}

export function hasValidDateString(value: unknown): boolean {
  if (!value || typeof value !== 'string' || !value.trim()) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function daysUntilExpiry(expiryDateStr: string | undefined, now = new Date()): number | null {
  if (!hasValidDateString(expiryDateStr)) return null;
  const exp = new Date(expiryDateStr!);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function resolveComplianceStatus(
  isKuwaiti: boolean,
  residencyExpiry: string | undefined,
  pamExpiry: string | undefined,
  mohExpiry: string | undefined,
  now = new Date()
): ReportsComplianceStatus {
  const resDays = isKuwaiti ? null : daysUntilExpiry(residencyExpiry, now);
  const pamDays = isKuwaiti ? null : daysUntilExpiry(pamExpiry, now);
  const mohDays = daysUntilExpiry(mohExpiry, now);

  const tracked = [resDays, pamDays, mohDays].filter((d) => d !== null) as number[];
  if (tracked.length === 0) return 'بيانات ناقصة';

  const minDays = Math.min(...tracked);
  if (minDays <= 0) return 'منتهي الصلاحية';
  if (minDays <= 30) return 'ينتهي قريباً (<30 يوم)';
  return 'ساري ومطابق';
}

export function resolveWpsStatus(
  iban: string | undefined,
  payslip: ReportsPayslipSnapshot | undefined,
  hasMonthlyRollup: boolean
): ReportsWpsStatus {
  const normalizedIban = String(iban || '').replace(/\s/g, '');
  if (normalizedIban.length < 15) return 'فروقات غير مسواة';
  if (!payslip) return 'فروقات غير مسواة';

  if (payslip.status === 'paid' || payslip.status === 'confirmed') {
    return 'مطابق ومحوّل';
  }
  if (payslip.status === 'draft' || payslip.status === 'review') {
    return hasMonthlyRollup || payslip.netSalary > 0 ? 'قيد المراجعة' : 'فروقات غير مسواة';
  }
  return 'قيد المراجعة';
}

export function pickEmployeeText(value: unknown, fallback = REPORTS_MISSING): string {
  const s = String(value ?? '').trim();
  return s || fallback;
}
