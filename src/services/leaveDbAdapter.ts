import { HrLeaveAllocation, LeaveRequest, LeaveSettlementVoucher } from '../types';
import { requireCompanyId } from '../utils/tenantGuards';

export interface LeaveDbRecord {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  paid_days?: number;
  unpaid_days?: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export function toLeaveDbRow(leave: LeaveRequest, companyId?: string): LeaveDbRecord {
  const resolvedCompanyId = requireCompanyId(companyId || leave.companyId);
  return {
    id: leave.id,
    company_id: resolvedCompanyId,
    employee_id: leave.employeeId,
    leave_type: leave.leaveType || (leave as any).type || 'ANNUAL',
    start_date: leave.startDate,
    end_date: leave.endDate,
    days: leave.totalDays || (leave as any).days || 0,
    paid_days: leave.paidDays,
    unpaid_days: leave.unpaidDays || 0,
    reason: leave.reason || '',
    status: leave.status || 'APPROVED',
    approved_by: leave.validatedBy || (leave as any).approvedBy || 'HR Manager',
    approved_at: leave.validatedAt || (leave as any).approvedAt || new Date().toISOString(),
    created_at: leave.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function fromLeaveDbRow(row: any): LeaveRequest {
  return {
    id: row.id,
    companyId: row.company_id || row.companyId,
    employeeId: row.employee_id || row.employeeId,
    leaveType: (row.leave_type || row.leaveType || 'ANNUAL') as any,
    startDate: row.start_date || row.startDate,
    endDate: row.end_date || row.endDate,
    totalDays: Number(row.days || row.totalDays) || 0,
    paidDays: row.paid_days !== undefined ? Number(row.paid_days) : row.paidDays,
    unpaidDays: Number(row.unpaid_days || row.unpaidDays) || 0,
    reason: row.reason || '',
    status: (row.status || 'APPROVED') as any,
    validatedBy: row.approved_by || row.validatedBy,
    validatedAt: row.approved_at || row.validatedAt,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  } as LeaveRequest;
}

export interface LeaveAllocationDbRecord {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  allocation_type: string;
  number_of_days: number;
  consumed_days: number;
  encashed_days: number;
  remaining_days?: number;
  date_from?: string;
  date_to?: string;
  state: string;
  name?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveSettlementDbRecord {
  id: string;
  company_id: string;
  employee_id: string;
  settlement_date: string;
  settlement_mode: string;
  carried_over_days: number;
  accrued_days: number;
  consumed_days: number;
  encashed_days: number;
  daily_wage: number;
  net_payable: number;
  status: string;
  notes?: string;
  payload: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

export function toLeaveAllocationDbRow(
  allocation: HrLeaveAllocation | Record<string, unknown>,
  companyId?: string
): LeaveAllocationDbRecord {
  const row = allocation as HrLeaveAllocation & Record<string, unknown>;
  const resolvedCompanyId = requireCompanyId(companyId || row.companyId || (row.company_id as string));
  const numberOfDays = Number(row.numberOfDays ?? row.days ?? 0);
  const consumedDays = Number(row.consumedDays ?? 0);
  const encashedDays = Number(row.encashedDays ?? 0);
  const remainingDays =
    row.remainingDays !== undefined
      ? Number(row.remainingDays)
      : Math.max(0, numberOfDays - consumedDays - encashedDays);

  return {
    id: String(row.id),
    company_id: resolvedCompanyId,
    employee_id: String(row.employeeId || row.employee_id),
    leave_type: String(row.leaveType || row.leave_type || 'ANNUAL'),
    allocation_type: String(row.allocationType || row.allocation_type || 'regular'),
    number_of_days: numberOfDays,
    consumed_days: consumedDays,
    encashed_days: encashedDays,
    remaining_days: remainingDays,
    date_from: toIsoDate(row.dateFrom || (row.date_from as string)),
    date_to: toIsoDate(row.dateTo || (row.date_to as string)),
    state: String(row.state || 'validate'),
    name: row.name ? String(row.name) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    created_at: String(row.createdAt || row.created_at || new Date().toISOString()),
    updated_at: new Date().toISOString(),
  };
}

export function fromLeaveAllocationDbRow(row: Record<string, unknown>): HrLeaveAllocation {
  return {
    id: String(row.id),
    companyId: String(row.company_id || row.companyId),
    employeeId: String(row.employee_id || row.employeeId),
    leaveType: (row.leave_type || row.leaveType || 'ANNUAL') as HrLeaveAllocation['leaveType'],
    allocationType: (row.allocation_type || row.allocationType || 'regular') as HrLeaveAllocation['allocationType'],
    numberOfDays: Number(row.number_of_days ?? row.numberOfDays ?? 0),
    consumedDays: Number(row.consumed_days ?? row.consumedDays ?? 0),
    encashedDays: Number(row.encashed_days ?? row.encashedDays ?? 0),
    remainingDays: Number(row.remaining_days ?? row.remainingDays ?? 0),
    dateFrom: String(row.date_from || row.dateFrom || ''),
    dateTo: row.date_to || row.dateTo ? String(row.date_to || row.dateTo) : undefined,
    state: (row.state || 'validate') as HrLeaveAllocation['state'],
    name: String(row.name || ''),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
  };
}

export function toLeaveSettlementDbRow(
  voucher: LeaveSettlementVoucher | Record<string, unknown>,
  companyId?: string
): LeaveSettlementDbRecord {
  const row = voucher as LeaveSettlementVoucher & Record<string, unknown>;
  const resolvedCompanyId = requireCompanyId(companyId || row.companyId || (row.company_id as string));
  const {
    id,
    companyId: _companyId,
    employeeId,
    settlementDate,
    settlementMode,
    carriedOverBalance,
    accruedBalance,
    consumedLeaveDays,
    encashedLeaveDays,
    dailyWage,
    netSettlementPayout,
    status,
    notes,
    createdAt,
    updatedAt,
    ...rest
  } = row;

  return {
    id: String(id),
    company_id: resolvedCompanyId,
    employee_id: String(employeeId || row.employee_id),
    settlement_date: toIsoDate(settlementDate || (row.settlement_date as string)) || new Date().toISOString().slice(0, 10),
    settlement_mode: String(settlementMode || row.settlement_mode || 'ENCASHMENT_LIQUIDATION'),
    carried_over_days: Number(carriedOverBalance ?? row.carried_over_days ?? 0),
    accrued_days: Number(accruedBalance ?? row.accrued_days ?? 0),
    consumed_days: Number(consumedLeaveDays ?? row.consumed_days ?? 0),
    encashed_days: Number(encashedLeaveDays ?? row.encashed_days ?? 0),
    daily_wage: Number(dailyWage ?? row.daily_wage ?? 0),
    net_payable: Number(netSettlementPayout ?? row.net_payable ?? 0),
    status: String(status || 'draft'),
    notes: notes ? String(notes) : undefined,
    payload: rest as Record<string, unknown>,
    created_at: String(createdAt || row.created_at || new Date().toISOString()),
    updated_at: String(updatedAt || row.updated_at || new Date().toISOString()),
  };
}

export function fromLeaveSettlementDbRow(row: Record<string, unknown>): LeaveSettlementVoucher {
  const payload = (row.payload && typeof row.payload === 'object' ? row.payload : {}) as Record<string, unknown>;
  return {
    ...payload,
    id: String(row.id),
    companyId: String(row.company_id || row.companyId),
    employeeId: String(row.employee_id || row.employeeId),
    settlementDate: String(row.settlement_date || row.settlementDate),
    settlementMode: (row.settlement_mode || row.settlementMode || 'ENCASHMENT_LIQUIDATION') as LeaveSettlementVoucher['settlementMode'],
    carriedOverBalance: Number(row.carried_over_days ?? row.carriedOverBalance ?? 0),
    accruedBalance: Number(row.accrued_days ?? row.accruedBalance ?? 0),
    consumedLeaveDays: Number(row.consumed_days ?? row.consumedLeaveDays ?? 0),
    encashedLeaveDays: Number(row.encashed_days ?? row.encashedLeaveDays ?? 0),
    dailyWage: Number(row.daily_wage ?? row.dailyWage ?? 0),
    netSettlementPayout: Number(row.net_payable ?? row.netSettlementPayout ?? 0),
    status: (row.status || 'draft') as LeaveSettlementVoucher['status'],
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  } as LeaveSettlementVoucher;
}
