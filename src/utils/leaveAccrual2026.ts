import {
  ACCRUAL_2026_ANNUAL_CAP,
  ACCRUAL_2026_EPOCH,
  ACCRUAL_2026_MONTHLY_RATE,
} from '../config/kuwaitLaborConstants';
import type { LeaveRequest } from '../types';
import { normalizeLeaveStatus, normalizeLeaveType } from './leaveModel';

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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInCalendarMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function inclusiveDaySpan(start: Date, end: Date): number {
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  if (e < s) return 0;
  return Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
}

function leaveMatchesEmployee(
  leave: Partial<LeaveRequest> & Record<string, unknown>,
  employeeId?: string,
  employeeCode?: string
): boolean {
  const lid = String(leave.employeeId || '').trim();
  const empId = String(employeeId || '').trim();
  const empCode = String(employeeCode || '').trim();
  if (!empId && !empCode) return true;
  if (!lid) return true;
  return lid === empId || (empCode && lid === empCode);
}

function isApprovedAccrualAffectingLeave(leave: Partial<LeaveRequest> & Record<string, unknown>): boolean {
  if (leave.isHistorical) return false;
  const status = normalizeLeaveStatus(String(leave.status || ''));
  if (status !== 'APPROVED' && status !== 'RETURNED') return false;
  const type = normalizeLeaveType(leave.leaveType as string);
  return type === 'ANNUAL' || type === 'COMPENSATORY';
}

/** Approved leave days overlapping a calendar month (for proportional accrual). */
export function countApprovedLeaveDaysInMonth(
  leaves: Array<Partial<LeaveRequest> & Record<string, unknown>> | undefined,
  year: number,
  monthIndex: number,
  employeeId?: string,
  employeeCode?: string
): number {
  if (!leaves?.length) return 0;

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex, daysInCalendarMonth(year, monthIndex));

  let total = 0;
  for (const leave of leaves) {
    if (!leaveMatchesEmployee(leave, employeeId, employeeCode)) continue;
    if (!isApprovedAccrualAffectingLeave(leave)) continue;

    const startDate = String(leave.startDate || '');
    const endDate = String(leave.endDate || leave.startDate || '');
    if (!startDate) continue;

    const leaveStart = startOfDay(new Date(startDate));
    const leaveEnd = startOfDay(new Date(endDate));
    if (isNaN(leaveStart.getTime()) || isNaN(leaveEnd.getTime())) continue;

    const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
    const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;
    if (overlapEnd < overlapStart) continue;

    const stored = Number(leave.totalDays ?? leave.daysCount ?? leave.numberOfDays ?? leave.days ?? 0);
    const overlapDays = inclusiveDaySpan(overlapStart, overlapEnd);
    const leaveSpan = inclusiveDaySpan(leaveStart, leaveEnd);

    if (stored > 0 && leaveSpan > 0 && stored <= leaveSpan) {
      total += Math.min(overlapDays, stored);
    } else {
      total += overlapDays;
    }
  }

  return Math.min(total, daysInCalendarMonth(year, monthIndex));
}

export interface Accrual2026Context {
  employeeId?: string;
  employeeCode?: string;
  leaves?: Array<Partial<LeaveRequest>>;
}

/**
 * Monthly accrual from Jan 2026 (or join date if later) through asOf.
 * Per month: (actual work days ÷ calendar days in month) × 2.5
 * Work days = eligible service days in month minus approved annual/comp leave days in that month.
 */
export function computeAccrual2026Unified(
  joinDateStr?: string | Date | null,
  asOfDate?: string | Date | null,
  context?: Accrual2026Context
): number {
  const asOf = startOfDay(resolveAsOfDate(asOfDate));
  const joinDate = startOfDay(resolveJoinDate(joinDateStr));
  const jan2026 = startOfDay(new Date(ACCRUAL_2026_EPOCH));

  const effectiveStart = joinDate > jan2026 ? joinDate : jan2026;
  if (effectiveStart > asOf || asOf.getFullYear() < 2026) {
    return 0;
  }

  const leaves = context?.leaves as Array<Partial<LeaveRequest> & Record<string, unknown>> | undefined;

  let totalAccrued = 0;
  let y = effectiveStart.getFullYear();
  let m = effectiveStart.getMonth();
  const asOfYear = asOf.getFullYear();
  const asOfMonth = asOf.getMonth();

  while (y < asOfYear || (y === asOfYear && m <= asOfMonth)) {
    const calendarDays = daysInCalendarMonth(y, m);
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m, calendarDays);

    let periodStart = monthStart;
    let periodEnd = monthEnd;

    if (y === effectiveStart.getFullYear() && m === effectiveStart.getMonth()) {
      periodStart = effectiveStart;
    }
    if (y === asOfYear && m === asOfMonth) {
      periodEnd = asOf;
    }

    const serviceDays = inclusiveDaySpan(periodStart, periodEnd);
    if (serviceDays > 0) {
      const leaveDays = countApprovedLeaveDaysInMonth(leaves, y, m, context?.employeeId, context?.employeeCode);
      const leaveInService = Math.min(leaveDays, serviceDays);
      const workDays = Math.max(0, serviceDays - leaveInService);
      totalAccrued += (workDays / calendarDays) * ACCRUAL_2026_MONTHLY_RATE;
    }

    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  return cleanAccrualDays(Math.min(ACCRUAL_2026_ANNUAL_CAP, totalAccrued));
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
