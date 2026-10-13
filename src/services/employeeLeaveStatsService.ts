import type { LeaveRequest } from '../types';
import { KUWAIT_ANNUAL_LEAVE_ENTITLEMENT_DAYS } from '../constants/kuwaitLaborLeave';
import { isEncashmentLeaveRequest } from '../utils/leaveModel';
import { resolveLeaveRequestDayCount } from '../utils/leaveModel';

export type EmployeeLeaveBalanceSnapshot = {
  annualEntitlement: number;
  annualRemaining: number;
  approvedLeaveDaysTotal: number;
  approvedLeaveCount: number;
  pendingLeaveCount: number;
};

function isApprovedLeave(status: unknown): boolean {
  const s = String(status || '').toUpperCase();
  return s === 'APPROVED' || s === 'RETURNED';
}

function leaveDaysFromRequest(row: LeaveRequest | Record<string, unknown>): number {
  return resolveLeaveRequestDayCount(row);
}

/** Tenant-scoped leave stats for Odoo smart buttons (employeeId + companyId). */
export function computeEmployeeLeaveStats(
  employee: Record<string, unknown> | null | undefined,
  leaveRequests: Array<LeaveRequest | Record<string, unknown>>
): EmployeeLeaveBalanceSnapshot {
  const leaveBalance = (employee?.leaveBalance || {}) as Record<string, unknown>;
  const fromNested = Number(leaveBalance.annualRemaining);
  const fromScalar = Number(
    employee?.remaining_leaves ?? employee?.paid_days_remaining ?? employee?.leaveBalance ?? 0
  );
  const annualRemaining = Number.isFinite(fromNested) && fromNested >= 0
    ? fromNested
    : Number.isFinite(fromScalar)
      ? fromScalar
      : 0;

  const approved = leaveRequests.filter(
    (r) => isApprovedLeave((r as LeaveRequest).status) && !isEncashmentLeaveRequest(r)
  );
  const approvedLeaveDaysTotal = approved.reduce((sum, r) => sum + leaveDaysFromRequest(r), 0);

  const pendingLeaveCount = leaveRequests.filter((r) => {
    const s = String((r as LeaveRequest).status || '').toUpperCase();
    return ['PENDING', 'PENDING_MANAGER', 'PENDING_HR', 'SUBMITTED', 'DRAFT'].includes(s);
  }).length;

  return {
    annualEntitlement: Number(leaveBalance.annualEntitlement) || KUWAIT_ANNUAL_LEAVE_ENTITLEMENT_DAYS,
    annualRemaining: Math.max(0, annualRemaining),
    approvedLeaveDaysTotal: Number(approvedLeaveDaysTotal.toFixed(2)),
    approvedLeaveCount: approved.length,
    pendingLeaveCount,
  };
}
