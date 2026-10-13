import type { Employee, HrLeaveAllocation, LeaveRequest, LeaveSettlementVoucher } from '../types';
import { getEmployeeUnifiedSummary, type EmployeeLeaveSummary } from './leaveEngine';
import { buildLeaveReportKpis, computeEmployeeEncashmentDays } from './leavePrintReport';

export interface EmployeeLeaveBalanceView extends EmployeeLeaveSummary {
  /** Paid annual leave days (excludes encashment ledger rows). */
  annualLeaveDaysUsed: number;
  /** Cash liquidation / encashment days (voucher SSOT when settlements provided). */
  encashmentDays: number;
  /** Annual + encashment — use for displays and reports. */
  totalDeductedDays: number;
  /** Net pool after annual leave and encashment. */
  displayNetBalance: number;
  displayUsedDays: number;
  fifoRemainingDisplay: {
    remainingCarried: number;
    remainingAccrued: number;
    remainingComp: number;
  };
}

function openingPoolFromSummary(summary: EmployeeLeaveSummary): number {
  return Number(
    (
      Number(summary.carriedOverDays || 0) +
      Number(summary.accruedAnnualDays || 0) +
      Number(summary.holidayCompensationDays || 0) +
      Number(summary.manualAdjustments || 0)
    ).toFixed(2)
  );
}

/**
 * Single display SSOT: engine summary + encashment (from vouchers and/or encash-leave rows).
 */
export function buildEmployeeLeaveBalanceView(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = [],
  settlements: LeaveSettlementVoucher[] = [],
  contract?: Parameters<typeof getEmployeeUnifiedSummary>[3]
): EmployeeLeaveBalanceView {
  const summary = getEmployeeUnifiedSummary(employee, allocations, leaves, contract);
  const openingPool = openingPoolFromSummary(summary);
  const encashmentDays = computeEmployeeEncashmentDays(employee, leaves, settlements);
  const kpis = buildLeaveReportKpis(summary, encashmentDays, openingPool);

  return {
    ...summary,
    annualLeaveDaysUsed: kpis.annualTaken,
    encashmentDays: kpis.encashTaken,
    totalDeductedDays: kpis.totalDeducted,
    displayNetBalance: kpis.netAvailable,
    displayUsedDays: kpis.totalDeducted,
    totalAvailableDays: kpis.netAvailable,
    netBalance: kpis.netAvailable,
    fifoRemainingDisplay: kpis.fifoRemaining,
    remainingCarried: kpis.fifoRemaining.remainingCarried,
    remainingAccrued: kpis.fifoRemaining.remainingAccrued,
    remainingComp: kpis.fifoRemaining.remainingComp,
  };
}

/** Alias for imports that read like the legacy engine helper. */
export const getEmployeeLeaveBalanceView = buildEmployeeLeaveBalanceView;
