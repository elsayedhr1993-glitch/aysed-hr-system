import { Employee, Contract, LeaveRequest, HrLeaveAllocation } from '../types';
import { getGlobalOpeningBalance, getGlobalAccrued2026, getGlobalCompensatoryDays } from './kuwaitLaw';
import { getApprovedHolidayWorkBalanceDays } from '../services/leaveBalanceLedgerService';
import { computeFifoLeaveAllocations, buildEmployeeBaselineAllocations } from '../services/leaveService';
import { normalizeLeaveStatus, normalizeLeaveType } from './leaveModel';
import { calculateKuwaitDailyRate, cleanKwdAmount } from './kuwaitPayrollMath';

function cleanDayDecimals(days: number | undefined | null): number {
  if (days === undefined || days === null || isNaN(days)) return 0;
  return Number((Math.round((days + Number.EPSILON) * 100) / 100).toFixed(2));
}

export interface LeaveRecord {
  type: 'annual' | 'unpaid' | 'sick' | 'compensation_holiday' | 'manual_adjustment';
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  date?: string;
  notes?: string;
}

export interface EmployeeLeaveSummary {
  carriedOverDays?: number;
  accruedAnnualDays: number;
  holidayCompensationDays: number;
  manualAdjustments: number;
  usedLeaveDays: number;
  consumedFromCarried: number;
  consumedFromAccrued: number;
  consumedFromComp: number;
  remainingCarried: number;
  remainingAccrued: number;
  remainingComp: number;
  fifoBreakdown?: {
    consumedFromCarried: number;
    consumedFromAccrued: number;
    consumedFromComp: number;
    remainingCarried: number;
    remainingAccrued: number;
    remainingComp: number;
  };
  totalAvailableDays: number;
  /** أيام إجازة معتمدة لا تُخصم من رصيد السنوية (تجاوز رصيد / بدون راتب) */
  unpaidLeaveDays?: number;
  netBalance?: number;
  cashSettlementAmount: number;
  dailyWageRate?: number;
  basicSalary?: number;
  comprehensiveSalary?: number;
}

export function matchesEmployeeIdentity(record: any, employee: any): boolean {
  if (!record || !employee) return false;

  const employeeId = String(employee?.id ?? employee?.employeeId ?? '').trim();
  const employeeCivil = String(employee?.civilId ?? employee?.civil_id_number ?? employee?.civil_id ?? '').replace(/\D/g, '');
  const recordEmployeeId = String(record?.employeeId ?? record?.employee_id ?? '').trim();
  const recordCivil = String(record?.civilId ?? record?.civil_id ?? record?.civil_id_number ?? '').replace(/\D/g, '');

  const employeeMatchesId = Boolean(employeeId && recordEmployeeId && employeeId === recordEmployeeId);
  const employeeMatchesCivil = Boolean(employeeCivil && recordCivil && employeeCivil === recordCivil);
  const crossMatch = Boolean((employeeId && recordCivil && employeeId === recordCivil) || (recordEmployeeId && employeeCivil && recordEmployeeId === employeeCivil));

  return employeeMatchesId || employeeMatchesCivil || crossMatch;
}

export function isApprovedLeaveStatus(status?: string): boolean {
  if (!status) return false;
  const normalized = String(status).trim().toLowerCase();
  const canonical = normalizeLeaveStatus(status);

  if (canonical === 'APPROVED' || canonical === 'RETURNED') return true;

  return ['approved', 'معتمد', 'validate', 'validated', 'returned', 'معتمدة', 'معتمدة نهائياً', 'موافقة نهائية'].includes(normalized) || normalized === 'approved';
}

/** paid = يُخصم من رصيد الإجازة السنوية فقط؛ unpaid = تجاوز رصيد (مسير رواتب لاحقاً) */
export function resolveLeavePaidUnpaidSplit(
  leave: any,
  balancePoolBeforeLeave: number
): { paid: number; unpaid: number; total: number } {
  const total = Number(leave?.totalDays ?? leave?.daysCount ?? leave?.numberOfDays ?? leave?.days ?? 0) || 0;
  if (total <= 0) return { paid: 0, unpaid: 0, total: 0 };

  const leaveType = normalizeLeaveType(leave?.leaveType);
  if (leaveType === 'BEREAVEMENT' || leaveType === 'COMPASSIONATE') {
    const annualPart = Number(leave?.annualDeductedDays ?? Math.max(0, total - 3));
    const pool = Math.max(0, balancePoolBeforeLeave);
    const paid = cleanDayDecimals(Math.min(Math.max(0, annualPart), pool));
    const unpaid = cleanDayDecimals(Math.max(0, total - paid));
    return { paid, unpaid, total };
  }

  // Always consume available balance first (never trust stored paidDays=0 with full unpaid).
  const pool = Math.max(0, balancePoolBeforeLeave);
  const paid = cleanDayDecimals(Math.min(total, pool));
  const unpaid = cleanDayDecimals(Math.max(0, total - paid));
  return { paid, unpaid, total };
}

/** Balance available immediately before this leave (for print/display when pool not passed). */
export function resolveLeaveBalancePoolHint(leave: any): number {
  const snapshot = Number(leave?.totalAvailableBalance ?? leave?.total_available_balance ?? NaN);
  if (!Number.isNaN(snapshot) && snapshot >= 0) return snapshot;
  const total = Number(leave?.totalDays ?? leave?.daysCount ?? leave?.numberOfDays ?? leave?.days ?? 0) || 0;
  const storedUnpaid = Number(leave?.unpaidDays ?? leave?.excessDays ?? leave?.aysed_unpaid_days ?? NaN);
  if (!Number.isNaN(storedUnpaid) && storedUnpaid >= 0 && total > storedUnpaid) {
    return cleanDayDecimals(total - storedUnpaid);
  }
  const storedPaid = Number(leave?.paidDays ?? leave?.aysed_paid_days ?? NaN);
  if (!Number.isNaN(storedPaid) && storedPaid > 0) return storedPaid;
  return 0;
}

function distributePaidLeaveAcrossBuckets(
  paidDays: number,
  carriedOverDays: number,
  accruedAnnualDays: number,
  holidayCompensationDays: number
): { consumedFromCarried: number; consumedFromAccrued: number; consumedFromComp: number } {
  let remaining = Number(paidDays.toFixed(2));
  let consumedFromCarried = 0;
  let consumedFromAccrued = 0;
  let consumedFromComp = 0;

  const buckets = [
    { available: carriedOverDays, apply: (take: number) => { consumedFromCarried += take; } },
    { available: accruedAnnualDays, apply: (take: number) => { consumedFromAccrued += take; } },
    { available: holidayCompensationDays, apply: (take: number) => { consumedFromComp += take; } },
  ];

  buckets.forEach((bucket) => {
    if (remaining <= 0) return;
    const take = Math.min(remaining, Math.max(0, Number(bucket.available.toFixed(2))));
    if (take <= 0) return;
    bucket.apply(Number(take.toFixed(2)));
    remaining = Number((remaining - take).toFixed(2));
  });

  return {
    consumedFromCarried: cleanDayDecimals(consumedFromCarried),
    consumedFromAccrued: cleanDayDecimals(consumedFromAccrued),
    consumedFromComp: cleanDayDecimals(consumedFromComp),
  };
}

function resolveHolidayCompensationDays(
  employee: Employee,
  allocations: HrLeaveAllocation[] = []
): number {
  const employeeId = String((employee as any).id || (employee as any).employeeId || '').trim();
  const companyId = String((employee as any).companyId || (employee as any).company_id || '').trim();
  const fromLedger = employeeId ? getApprovedHolidayWorkBalanceDays(employeeId, companyId || undefined) : 0;
  const ledgerCompDays = Number(getGlobalCompensatoryDays(employee) ?? 0);
  const allocationCompDays = (allocations || [])
    .filter((allocation: any) => {
      if (!matchesEmployeeIdentity(allocation, employee)) return false;
      const state = String(allocation.state || allocation.status || '').toLowerCase();
      const allowedState = ['approved', 'validate', 'validated', 'confirm', 'done', ''];
      if (!allowedState.includes(state)) return false;
      const allocationType = String(allocation.allocationType || '').toLowerCase();
      const notes = String(allocation.name || allocation.notes || '').toLowerCase();
      const isCompType = allocationType === 'compensatory_off' || allocationType === 'compensatory';
      const isHolidayAccrual =
        allocationType === 'accrual' &&
        /عطلة|تعويض|مادة\s*68|holiday|إضافة للرصيد|comp[- ]?off/i.test(notes);
      const isCompLabel = /تعويضي|عطلة|compensatory|comp_off|day in lieu/i.test(notes);
      return isCompType || isCompLabel || isHolidayAccrual;
    })
    .reduce((sum, allocation: any) => sum + Number(allocation.numberOfDays ?? allocation.days ?? 0), 0);

  return Math.max(fromLedger, ledgerCompDays, Number(allocationCompDays || 0));
}

export function aggregateAnnualLeaveDeductions(
  employee: Employee,
  leaves: LeaveRequest[] = [],
  openingPool: number
): { usedLeaveDays: number; unpaidLeaveDays: number } {
  const approved = getApprovedEmployeeLeaveRequests(employee, leaves)
    .filter((leave) => {
      const leaveType = normalizeLeaveType(leave.leaveType);
      if (leaveType === 'ANNUAL') return true;
      if ((leaveType === 'BEREAVEMENT' || leaveType === 'COMPASSIONATE') && leave.isSplitBereavement) return true;
      return false;
    })
    .sort((a, b) => String(a.startDate || '').localeCompare(String(b.startDate || '')));

  let pool = Math.max(0, openingPool);
  let usedLeaveDays = 0;
  let unpaidLeaveDays = 0;

  approved.forEach((leave) => {
    const split = resolveLeavePaidUnpaidSplit(leave, pool);
    usedLeaveDays += split.paid;
    unpaidLeaveDays += split.unpaid;
    pool = Math.max(0, pool - split.paid);
  });

  return {
    usedLeaveDays: cleanDayDecimals(usedLeaveDays),
    unpaidLeaveDays: cleanDayDecimals(unpaidLeaveDays)
  };
}

export function getApprovedEmployeeLeaveRequests(employee: any, leaves: any[] = []): any[] {
  return (leaves || []).filter((req: any) => {
    if (!req) return false;
    const matchesEmployee = matchesEmployeeIdentity(req, employee);
    const matchesStatus = isApprovedLeaveStatus(req.status);
    const totalDays = Number(req.daysCount ?? req.totalDays ?? req.numberOfDays ?? req.days ?? 0) || 0;
    return matchesEmployee && matchesStatus && totalDays > 0;
  });
}

export function calculateUnifiedLeaveBalance(
  accruedAnnual: number,
  records: LeaveRecord[],
  basicSalary: number = 0,
  allowances: number = 0
): EmployeeLeaveSummary {
  const holidayCompensationDays = records
    .filter(r => (r.type === 'compensation_holiday' || (r.type as string) === 'compensatory') && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);

  const manualAdjustments = records
    .filter(r => r.type === 'manual_adjustment' && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);

  const grossPool = Number((Number(accruedAnnual || 0) + holidayCompensationDays + manualAdjustments).toFixed(2));
  let pool = grossPool;
  let usedLeaveDays = 0;
  let unpaidLeaveDays = 0;
  records
    .filter(r => (r.type === 'annual' || (r.type as string) === 'ANNUAL') && r.status === 'approved')
    .forEach((r) => {
      const total = Number(r.days || 0);
      const paid = Math.min(total, pool);
      const unpaid = Math.max(0, total - paid);
      usedLeaveDays += paid;
      unpaidLeaveDays += unpaid;
      pool = Math.max(0, pool - paid);
    });
  usedLeaveDays = Number(usedLeaveDays.toFixed(2));
  unpaidLeaveDays = Number(unpaidLeaveDays.toFixed(2));

  const totalEarnedAndCarried = grossPool;
  const totalAvailableDays = Number(Math.max(0, totalEarnedAndCarried - usedLeaveDays).toFixed(2));

  const basicSalaryOnly = Number(basicSalary || 0);
  const dailyWageRate = calculateKuwaitDailyRate(basicSalaryOnly);
  const cashSettlementAmount = cleanKwdAmount(totalAvailableDays * dailyWageRate);

  return {
    carriedOverDays: 0,
    accruedAnnualDays: Number(accruedAnnual || 0),
    holidayCompensationDays,
    manualAdjustments,
    usedLeaveDays,
    unpaidLeaveDays,
    consumedFromCarried: 0,
    consumedFromAccrued: usedLeaveDays,
    consumedFromComp: 0,
    remainingCarried: 0,
    remainingAccrued: totalAvailableDays,
    remainingComp: holidayCompensationDays,
    totalAvailableDays,
    netBalance: Number(totalAvailableDays.toFixed(2)),
    cashSettlementAmount,
    dailyWageRate,
    basicSalary: basicSalaryOnly,
    comprehensiveSalary: basicSalaryOnly
  };
}

export function buildUnifiedLeaveSummary(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = [],
  contract?: Contract
): EmployeeLeaveSummary {
  const approvedLeaves = getApprovedEmployeeLeaveRequests(employee, leaves);
  const carriedOverDays = Number((employee as any).carriedOverBalance ?? (employee as any).carriedOverLeave2025 ?? getGlobalOpeningBalance(employee) ?? 0);
  const accruedAnnualDays = Number((employee as any).accruedAnnualLeave ?? getGlobalAccrued2026(employee) ?? 0);
  const holidayCompensationDays = resolveHolidayCompensationDays(employee, allocations);
  const manualAdjustments = 0;
  const grossPool = Number((carriedOverDays + accruedAnnualDays + holidayCompensationDays + manualAdjustments).toFixed(2));
  const { usedLeaveDays, unpaidLeaveDays } = aggregateAnnualLeaveDeductions(employee, leaves, grossPool);

  const bucketUsage = distributePaidLeaveAcrossBuckets(
    usedLeaveDays,
    carriedOverDays,
    accruedAnnualDays,
    holidayCompensationDays
  );
  const consumedFromCarried = bucketUsage.consumedFromCarried;
  const consumedFromAccrued = bucketUsage.consumedFromAccrued;
  const consumedFromComp = bucketUsage.consumedFromComp;

  const remainingCarried = Number(Math.max(0, carriedOverDays - consumedFromCarried).toFixed(2));
  const remainingAccrued = Number(Math.max(0, accruedAnnualDays - consumedFromAccrued).toFixed(2));
  const remainingComp = Number(Math.max(0, holidayCompensationDays - consumedFromComp).toFixed(2));
  const totalAvailableDays = Number(Math.max(0, grossPool - usedLeaveDays).toFixed(2));
  const basicSalaryValue = Number(contract?.basicSalary ?? (employee as any).basicSalary ?? (employee as any).basic_salary ?? (employee as any).salary ?? 0) || 0;
  const dailyWageRate = calculateKuwaitDailyRate(basicSalaryValue);
  const cashSettlementAmount = cleanKwdAmount(totalAvailableDays * dailyWageRate);

  return {
    carriedOverDays,
    accruedAnnualDays,
    holidayCompensationDays,
    manualAdjustments,
    usedLeaveDays,
    unpaidLeaveDays,
    consumedFromCarried,
    consumedFromAccrued,
    consumedFromComp,
    remainingCarried: Number(remainingCarried.toFixed(2)),
    remainingAccrued: Number(remainingAccrued.toFixed(2)),
    remainingComp: Number(remainingComp.toFixed(2)),
    fifoBreakdown: {
      consumedFromCarried,
      consumedFromAccrued,
      consumedFromComp,
      remainingCarried: Number(remainingCarried.toFixed(2)),
      remainingAccrued: Number(remainingAccrued.toFixed(2)),
      remainingComp: Number(remainingComp.toFixed(2))
    },
    totalAvailableDays: Number(totalAvailableDays.toFixed(2)),
    netBalance: Number(Math.max(0, totalAvailableDays).toFixed(2)),
    cashSettlementAmount: cleanKwdAmount(Math.max(0, totalAvailableDays) * dailyWageRate),
    dailyWageRate,
    basicSalary: basicSalaryValue,
    comprehensiveSalary: basicSalaryValue
  };
}

export function getEmployeeUnifiedSummary(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = [],
  contract?: Contract
): EmployeeLeaveSummary {
  return buildUnifiedLeaveSummary(employee, allocations, leaves, contract);
}

export function normalizeLeaveBalanceInputs(
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = []
): { allocations: HrLeaveAllocation[]; leaves: LeaveRequest[] } {
  return {
    allocations: (allocations || []).map((allocation: any) => ({
      ...allocation,
      numberOfDays: Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0,
      consumedDays: Number(allocation.consumedDays || 0) || 0,
      remainingDays: allocation.remainingDays !== undefined
        ? Number(allocation.remainingDays) || 0
        : Math.max(0, (Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0) - (Number(allocation.consumedDays || 0) || 0)),
      allocationType: allocation.allocationType || 'regular',
      state: allocation.state || 'validate',
      name: allocation.name || allocation.notes,
      dateFrom: allocation.dateFrom || allocation.allocationDate || '2026-01-01'
    })),
    leaves: (leaves || []).map((leave: any) => ({
      ...leave,
      totalDays: Number(leave.totalDays ?? leave.daysCount ?? leave.numberOfDays ?? leave.days ?? 0) || 0,
      paidDays: leave.paidDays !== undefined ? Number(leave.paidDays) || 0 : undefined,
      unpaidDays: leave.unpaidDays !== undefined ? Number(leave.unpaidDays) || 0 : undefined,
      status: String(leave.status || '').toUpperCase()
    }))
  };
}

export function buildLeaveRecordsFromEmployee(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = []
): {
  carriedOver: number;
  accrued2026: number;
  accruedAnnual: number;
  records: LeaveRecord[];
  basicSalary: number;
  allowances: number;
  compensatoryDays: number;
} {
  const empId = String(employee.id || '').trim();
  const empCode = String((employee as any).employeeCode || '').trim();
  const empCivil = String((employee as any).civilId || (employee as any).civil_id_number || '').replace(/\D/g, '');

  const basicSalary = Number((employee as any).basicSalary ?? (employee as any).basic_salary ?? (employee as any).salary ?? 0) || 0;
  const allowances = Number((employee as any).housingAllowance ?? 0) + Number((employee as any).transportAllowance ?? 0) + Number((employee as any).otherAllowance ?? 0) + Number((employee as any).otherAllowances ?? 0);

  const carriedOver = Number((employee as any).carriedOverBalance ?? (employee as any).carriedOverLeave2025 ?? getGlobalOpeningBalance(employee) ?? 0) || 0;
  const accrued2026 = Number((employee as any).accruedAnnualLeave ?? getGlobalAccrued2026(employee) ?? 0) || 0;
  const compensatoryDays = Number(getGlobalCompensatoryDays(employee) ?? 0) || 0;
  const recordMap: LeaveRecord[] = [];

  (allocations || []).forEach((allocation: any) => {
    const matchesEmployee =
      allocation.employeeId === empId ||
      allocation.employeeId === empCode ||
      ((employee as any).civilId && String(allocation.civilId || '').replace(/\D/g, '') === empCivil) ||
      ((employee as any).civil_id_number && String(allocation.civilId || '').replace(/\D/g, '') === empCivil);

    if (!matchesEmployee) return;

    const typeName = String(allocation.name || allocation.notes || '').toLowerCase();
    const isCompensatory = allocation.allocationType === 'compensatory_off' || allocation.allocationType === 'compensatory' || /عطلة|تعويضي|compensatory/i.test(typeName);

    if (isCompensatory) {
      recordMap.push({
        type: 'compensation_holiday',
        days: Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0,
        status: String(allocation.state || '').toLowerCase() === 'approved' || String(allocation.state || '').toLowerCase() === 'validate' ? 'approved' : 'pending',
        date: allocation.dateFrom || allocation.allocationDate,
        notes: allocation.name || allocation.notes
      });
    }
  });

  const approvedLeaves = getApprovedEmployeeLeaveRequests(employee, leaves || []);
  approvedLeaves.forEach((leave: any) => {
    const leaveType = normalizeLeaveType(leave.leaveType);
    if (leaveType === 'ANNUAL' || leaveType === 'COMPENSATORY') {
      recordMap.push({
        type: leaveType === 'COMPENSATORY' ? 'compensation_holiday' : 'annual',
        days: Number(leave.totalDays ?? leave.daysCount ?? leave.numberOfDays ?? leave.days ?? 0) || 0,
        status: 'approved',
        date: leave.startDate,
        notes: leave.reason || leave.name
      });
    }
  });

  return {
    carriedOver,
    accrued2026,
    accruedAnnual: carriedOver + accrued2026,
    records: recordMap,
    basicSalary,
    allowances,
    compensatoryDays
  };
}

export function calculateLeaveBalanceSnapshot(input: { employee: Employee; allocations?: HrLeaveAllocation[]; leaves?: LeaveRequest[]; contract?: Contract }) {
  const summary = buildUnifiedLeaveSummary(input.employee, input.allocations || [], input.leaves || [], input.contract);
  const netBalance = cleanDayDecimals(Math.max(0, Number(summary.totalAvailableDays ?? 0)));

  return {
    entries: [],
    carriedForwardDays: summary.carriedOverDays ?? 0,
    accruedDays: summary.accruedAnnualDays ?? 0,
    holidayCompensationDays: summary.holidayCompensationDays ?? 0,
    manualAdjustmentDays: summary.manualAdjustments ?? 0,
    approvedLeaveDeductionDays: summary.usedLeaveDays ?? 0,
    unpaidLeaveExcessDays: summary.unpaidLeaveDays ?? 0,
    consumedFromCarried: summary.consumedFromCarried ?? 0,
    consumedFromAccrued: summary.consumedFromAccrued ?? 0,
    consumedFromComp: summary.consumedFromComp ?? 0,
    remainingCarried: summary.remainingCarried ?? 0,
    remainingAccrued: summary.remainingAccrued ?? 0,
    remainingComp: summary.remainingComp ?? 0,
    totalBalance: Number(summary.totalAvailableDays ?? 0),
    netBalance,
    dailyWage: summary.dailyWageRate ?? 0,
    cashLiability: summary.cashSettlementAmount ?? 0,
    basicSalary: summary.basicSalary ?? 0,
    comprehensiveSalary: summary.comprehensiveSalary ?? 0
  };
}

export const LeaveBalanceEngine = {
  normalizeInputs: normalizeLeaveBalanceInputs,
  buildLedger: () => [],
  calculate: calculateLeaveBalanceSnapshot,
};

/**
 * calculateNetWorkingDays
 * Excludes Fridays and public holidays from the date range.
 * Assumes a standard Kuwait work week where Friday is off.
 */
export function calculateNetWorkingDays(startDate: string, endDate: string, holidaysList: any[] = []): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;
  
  let netDays = 0;
  let current = new Date(start);
  
  while (current <= end) {
    // 5 = Friday
    const isFriday = current.getDay() === 5;
    
    // Check if it's a public holiday
    const dateString = current.toISOString().split('T')[0];
    const isHoliday = holidaysList.some(h => {
      if (h.date) return h.date === dateString;
      if (h.startDate && h.endDate) {
        return dateString >= h.startDate && dateString <= h.endDate;
      }
      return false;
    });

    if (!isFriday && !isHoliday) {
      netDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return netDays;
}

/** Annual travel ticket cash (KWD) from employee snapshot, active contract, then leave policy — never a hardcoded default. */
export function resolveAnnualTicketAllowanceKwd(
  employee?: Record<string, unknown> | null,
  leavePolicy?: Record<string, unknown> | null,
  contract?: Record<string, unknown> | null
): number {
  const fromEmployee = Number(
    employee?.annualTicketAllowanceKwd ??
      employee?.ticketAllowanceKwd ??
      employee?.ticketAllowance ??
      employee?.ticketCashAmount ??
      0
  );
  if (fromEmployee > 0) return cleanKwdAmount(fromEmployee);

  const fromContract = Number(
    contract?.annualTicketAllowanceKwd ??
      contract?.ticketAllowanceKwd ??
      contract?.ticketAllowance ??
      contract?.airTicketCashKwd ??
      0
  );
  if (fromContract > 0) return cleanKwdAmount(fromContract);

  const ticketFlag = employee?.airTicketAllowance ?? contract?.airTicketAllowance;
  if (ticketFlag === false || ticketFlag === 0 || ticketFlag === 'false') {
    return 0;
  }

  const fromPolicy = Number(leavePolicy?.annualTicketAllowanceKwd ?? 0);
  if (fromPolicy > 0) return cleanKwdAmount(fromPolicy);

  return 0;
}

export function computeLeaveRequest(
  employee: Employee, 
  startDate: string, 
  endDate: string, 
  holidaysList: any[] = [],
  totalAvailable: number = 0,
  ticketAllowance: number = 0
) {
  const totalNetDays = calculateNetWorkingDays(startDate, endDate, holidaysList);
  
  const paidDays = Number((Math.min(totalNetDays, Math.max(0, totalAvailable))).toFixed(2));
  const unpaidDays = Number((Math.max(0, totalNetDays - totalAvailable)).toFixed(2));
  const balanceAfter = Number((Math.max(0, totalAvailable - totalNetDays)).toFixed(2));
  
  // Kuwait Law: daily wage = Basic Salary / 26 (Allowances excluded)
  const basicSalary = Number((employee as any).basicSalary || (employee as any).basic_salary || (employee as any).salary || 0);
  const dailyWage = calculateKuwaitDailyRate(basicSalary);
  
  const paidLeavePay = cleanKwdAmount(paidDays * dailyWage);
  const netPayable = paidLeavePay + (ticketAllowance || 0);

  return {
    totalNetDays,
    totalAvailable,
    paidDays,
    unpaidDays,
    balanceAfter,
    dailyWage,
    paidLeavePay,
    netPayable
  };
}

export interface LeaveMetricsResult {
  accruedBalance: number;
  totalBalance: number;
  paidDays: number;
  unpaidDays: number;
  dailyWage: number;
  totalLeavePay: number;
  endingBalance: number;
  bereavementStatutoryDays?: number;
  annualDeductedDays?: number;
  isSplitBereavement?: boolean;
  explanation?: string;
}

export const calculateAysedLeaveMetrics = (
  dateFrom: string,
  dateTo: string,
  netAvailable: number = 0,
  monthlyWage: number = 0,
  joiningDate: string = '2026-01-01',
  previousApprovedLeaves: number = 0,
  publicHolidays: string[] = [],
  leaveType: string = 'ANNUAL',
  bereavementDegree: 'FIRST' | 'SECOND' | 'OTHER' = 'FIRST'
): LeaveMetricsResult => {
  const totalAvailable = Math.max(0, Number(netAvailable) || 0);

  // 1. Count requested days (excluding Fridays and public holidays)
  let requestedDays = 0;
  const current = new Date(dateFrom);
  const end = new Date(dateTo);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 5 = Friday
    const dateStr = current.toISOString().split('T')[0];
    if (dayOfWeek !== 5 && !publicHolidays.includes(dateStr)) {
      requestedDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  // 2. Split paid vs unpaid based on leaveType
  let paidDays = 0;
  let unpaidDays = 0;
  let endingBalance = totalAvailable;
  let bereavementStatutoryDays = 0;
  let annualDeductedDays = 0;
  let isSplitBereavement = false;
  let explanation = '';

  if (leaveType === 'BEREAVEMENT' || leaveType === 'COMPASSIONATE') {
    // Kuwait Labor Law Article 77:
    // 3 days fully paid without deduction from annual balance for 1st & 2nd degree relatives
    const statutoryCap = (bereavementDegree === 'FIRST' || bereavementDegree === 'SECOND') ? 3 : 0;
    bereavementStatutoryDays = Math.min(requestedDays, statutoryCap);
    const remainingDays = Math.max(0, requestedDays - bereavementStatutoryDays);

    if (remainingDays === 0) {
      // Within 3 days statutory limit
      paidDays = requestedDays;
      unpaidDays = 0;
      annualDeductedDays = 0;
      endingBalance = totalAvailable;
      isSplitBereavement = false;
      explanation = `إجازة عزاء مستحقة وفق المادة 77 (${bereavementStatutoryDays} أيام مدفوعة بالكامل - خصم 0 من الرصيد السنوي)`;
    } else {
      // Extended duration (e.g. 14 days total -> 3 bereavement + 11 annual)
      isSplitBereavement = true;
      annualDeductedDays = Math.min(totalAvailable, remainingDays);
      unpaidDays = Math.max(0, remainingDays - annualDeductedDays);
      paidDays = bereavementStatutoryDays + annualDeductedDays;
      endingBalance = Math.max(0, totalAvailable - annualDeductedDays);
      explanation = `تم تطبيق دمج المادة 77: ${bereavementStatutoryDays} أيام عزاء مدفوعة بالكامل (بدون خصم) + ${annualDeductedDays} يوم مستقطعة من الرصيد السنوي${unpaidDays > 0 ? ` + ${unpaidDays} يوم بدون راتب` : ''}`;
    }
  } else if (['COMPENSATORY', 'SICK', 'MATERNITY', 'HAJJ', 'HOURLY_PERMISSION'].includes(leaveType)) {
    paidDays = requestedDays;
    unpaidDays = 0;
    endingBalance = totalAvailable; // Does not deduct from annual leave balance
  } else if (leaveType === 'UNPAID') {
    paidDays = 0;
    unpaidDays = requestedDays;
    endingBalance = totalAvailable;
  } else {
    // ANNUAL leave
    paidDays = Math.min(totalAvailable, requestedDays);
    unpaidDays = Math.max(0, requestedDays - totalAvailable);
    endingBalance = Math.max(0, totalAvailable - paidDays);
  }

  // 3. Article 70 Financial Calculation (Daily Wage = Basic / 26)
  const wage = Number(monthlyWage) || 0;
  const dailyWage = calculateKuwaitDailyRate(wage);
  const leavePay = cleanKwdAmount(paidDays * dailyWage);

  return {
    accruedBalance: Number(totalAvailable.toFixed(2)),
    totalBalance: Number(totalAvailable.toFixed(2)),
    paidDays: Number(paidDays.toFixed(2)),
    unpaidDays: Number(unpaidDays.toFixed(2)),
    dailyWage,
    totalLeavePay: leavePay,
    endingBalance: Number(endingBalance.toFixed(2)),
    bereavementStatutoryDays,
    annualDeductedDays,
    isSplitBereavement,
    explanation
  };
};

export interface SettlementConstraintViolation {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SettlementConstraintResult {
  isValid: boolean;
  violations: SettlementConstraintViolation[];
}

/**
 * Validates mathematical integrity and constraints for leave settlements:
 * - Negative balance protection: spent days cannot exceed (carried + accrued).
 * - Exact mathematical identity: remaining === (carried + accrued) - spent.
 * - Non-negative operands.
 */
export function validateSettlementConstraints(params: {
  carriedOverBalance: number;
  accruedBalance: number;
  consumedLeaveDays: number;
  remainingBalanceAfter: number;
  basicSalary: number;
  dailyWage?: number;
}): SettlementConstraintResult {
  const violations: SettlementConstraintViolation[] = [];

  const carried = Number(params.carriedOverBalance) || 0;
  const accrued = Number(params.accruedBalance) || 0;
  const spent = Number(params.consumedLeaveDays) || 0;
  const remaining = Number(params.remainingBalanceAfter) || 0;
  const totalAvailable = carried + accrued;

  if (spent < 0) {
    violations.push({
      field: 'consumedLeaveDays',
      message: 'أيام الإجازة المصروفة لا يمكن أن تكون قيمة سالبة.',
      severity: 'error'
    });
  }

  if (spent > totalAvailable + 0.001) {
    violations.push({
      field: 'consumedLeaveDays',
      message: `أيام الإجازة المصروفة (${spent} يوم) تتجاوز إجمالي الرصيد المتاح (${totalAvailable.toFixed(2)} يوم).`,
      severity: 'error'
    });
  }

  const expectedRemaining = Number((totalAvailable - spent).toFixed(2));
  if (Math.abs(remaining - expectedRemaining) > 0.01) {
    violations.push({
      field: 'remainingBalanceAfter',
      message: `تضارب رياضي: الرصيد المتبقي (${remaining}) لا يطابق المعادلة: (${carried} مرحل + ${accrued} مكتسب) - ${spent} مصروف = ${expectedRemaining}.`,
      severity: 'error'
    });
  }

  if (params.basicSalary < 0) {
    violations.push({
      field: 'basicSalary',
      message: 'الراتب الأساسي لا يمكن أن يكون سالباً.',
      severity: 'error'
    });
  }

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations
  };
}
