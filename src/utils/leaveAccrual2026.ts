import {
  ACCRUAL_2026_ANNUAL_CAP,
  ACCRUAL_2026_EPOCH,
  ACCRUAL_2026_MONTHLY_RATE,
} from '../config/kuwaitLaborConstants';

export { ACCRUAL_2026_ANNUAL_CAP, ACCRUAL_2026_EPOCH, ACCRUAL_2026_MONTHLY_RATE };

function cleanAccrualDays(days: number): number {
  if (days === undefined || days === null || isNaN(days)) return 0;
  return Number((Math.round((days + Number.EPSILON) * 100) / 100).toFixed(2));
}

function resolveJoinDate(joinDateStr?: string | Date | null): Date {
  const jan2026 = new Date(ACCRUAL_2026_EPOCH);
  if (!joinDateStr) return jan2026;

  const joinDate = joinDateStr instanceof Date ? joinDateStr : new Date(joinDateStr);
  if (isNaN(joinDate.getTime())) return jan2026;
  return joinDate;
}

function resolveAsOfDate(asOfDate?: string | Date | null): Date {
  if (!asOfDate) return new Date();
  const asOf = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);
  return isNaN(asOf.getTime()) ? new Date() : asOf;
}

/**
 * Monthly accrual from Jan 2026 (or join date if later) through asOf (inclusive month count).
 */
export function computeAccrual2026Unified(
  joinDateStr?: string | Date | null,
  asOfDate?: string | Date | null
): number {
  const asOf = resolveAsOfDate(asOfDate);
  const joinDate = resolveJoinDate(joinDateStr);
  const jan2026 = new Date(ACCRUAL_2026_EPOCH);

  const effectiveStart = joinDate > jan2026 ? joinDate : jan2026;
  if (effectiveStart > asOf || asOf.getFullYear() < 2026) {
    return 0;
  }

  const startYear = effectiveStart.getFullYear();
  const startMonth = effectiveStart.getMonth();
  const asOfYear = asOf.getFullYear();
  const asOfMonth = asOf.getMonth();

  const monthsCount = Math.max(0, (asOfYear - startYear) * 12 + (asOfMonth - startMonth) + 1);
  const accrued = Math.min(ACCRUAL_2026_ANNUAL_CAP, monthsCount * ACCRUAL_2026_MONTHLY_RATE);

  return cleanAccrualDays(accrued);
}

/** Extract hire/join date string from employee-like objects. */
export function extractEmployeeJoinDate(
  employee?: {
    joinDate?: string;
    hireDate?: string;
    date_start?: string;
    startDate?: string;
    openingLeaveDate?: string;
    openingDate?: string;
    [key: string]: unknown;
  } | string | Date | null
): string | undefined {
  if (!employee) return undefined;
  if (typeof employee === 'string') return employee;
  if (employee instanceof Date) return employee.toISOString().split('T')[0];

  return (
    employee.joinDate ||
    employee.hireDate ||
    employee.date_start ||
    employee.startDate ||
    employee.openingLeaveDate ||
    employee.openingDate
  );
}
