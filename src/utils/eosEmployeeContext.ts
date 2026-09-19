import type { Contract } from '../types';
import {
  getEmployeeUnifiedSummary,
  matchesEmployeeIdentity,
  normalizeLeaveBalanceInputs,
} from './leaveEngine';
import type { KuwaitEosInput } from './kuwaitPayrollEngine';

export type EosTerminationType = KuwaitEosInput['terminationType'];

export interface EmployeeLeaveEosSnapshot {
  carried: number;
  earned: number;
  compensatory: number;
  consumed: number;
  netAvailable: number;
  unpaidExcess: number;
}

export function resolveEmployeeServiceStartDate(emp: Record<string, unknown> | null | undefined): string {
  if (!emp) return new Date().toISOString().slice(0, 10);
  const raw =
    emp.hireDate ||
    emp.commencementDate ||
    emp.joinDate ||
    emp.contractStartDate;
  if (!raw) return new Date().toISOString().slice(0, 10);
  return String(raw).slice(0, 10);
}

export function resolveEmployeeDisplayName(emp: Record<string, unknown>): string {
  return String(
    emp.fullNameAr ||
      emp.nameAr ||
      emp.name ||
      emp.fullNameEn ||
      emp.nameEn ||
      emp.id ||
      'موظف'
  );
}

export function findRunningContractForEmployee(
  employeeId: string,
  contracts: Array<Record<string, unknown>>
): Record<string, unknown> | undefined {
  const forEmp = contracts.filter(
    (c) => c.employeeId === employeeId || c.id === employeeId
  );
  const running = forEmp.find((c) => {
    const status = String(c.status || c.contractStatus || '').toUpperCase();
    return status === 'RUNNING' || status === 'running';
  });
  return running || forEmp[0];
}

export function resolveEmployeeGrossSalary(
  emp: Record<string, unknown>,
  contracts: Array<Record<string, unknown>> = []
): number {
  const contract = findRunningContractForEmployee(String(emp.id), contracts);
  if (contract) {
    const basic = Number(contract.basicSalary ?? 0);
    const housing = Number(contract.housingAllowance ?? 0);
    const transport = Number(contract.transportAllowance ?? 0);
    const medical = Number(contract.medicalAllowance ?? contract.otherAllowance ?? 0);
    const sum = basic + housing + transport + medical;
    if (sum > 0) return sum;
  }

  const fromEmp =
    Number(emp.basicSalary ?? 0) +
    Number(emp.housingAllowance ?? 0) +
    Number(emp.transportAllowance ?? 0) +
    Number(emp.medicalAllowance ?? 0);

  if (fromEmp > 0) return fromEmp;

  return Number(emp.grossSalary ?? emp.salary ?? 0);
}

export function resolveContractType(
  emp: Record<string, unknown>,
  contracts: Array<Record<string, unknown>> = []
): Contract['contractType'] {
  const contract = findRunningContractForEmployee(String(emp.id), contracts);
  const raw = contract?.contractType ?? emp.contractType;
  if (raw === 'FIXED_TERM' || raw === 'INDEFINITE') return raw;
  return 'INDEFINITE';
}

export function getEmployeeLeaveEosSnapshot(
  emp: Record<string, unknown>,
  leaveAllocations: unknown[],
  leaveRequests: unknown[]
): EmployeeLeaveEosSnapshot {
  const empRecord = {
    ...emp,
    id: emp.id,
    employeeCode: emp.employeeCode || emp.id,
    fullNameAr: emp.fullNameAr || emp.nameAr || emp.name,
    nameAr: emp.nameAr || emp.name,
    name: emp.name,
    civilId: emp.civilId,
    joinDate: resolveEmployeeServiceStartDate(emp),
    basicSalary: emp.basicSalary,
    salary: emp.salary || emp.basicSalary,
  };

  const scopedAllocations = (leaveAllocations || []).filter((a) =>
    matchesEmployeeIdentity(a as Record<string, unknown>, empRecord)
  );
  const scopedLeaves = (leaveRequests || []).filter((l) =>
    matchesEmployeeIdentity(l as Record<string, unknown>, empRecord)
  );
  const { allocations, leaves } = normalizeLeaveBalanceInputs(
    scopedAllocations as never[],
    scopedLeaves as never[]
  );
  const summary = getEmployeeUnifiedSummary(empRecord as never, allocations, leaves);

  return {
    carried: Number(summary.carriedOverDays || 0),
    earned: Number(summary.accruedAnnualDays || 0),
    compensatory: Number(summary.holidayCompensationDays || 0),
    consumed: Number(summary.usedLeaveDays || 0),
    netAvailable: Number(summary.totalAvailableDays || 0),
    unpaidExcess: Number(summary.unpaidLeaveDays || 0),
  };
}
