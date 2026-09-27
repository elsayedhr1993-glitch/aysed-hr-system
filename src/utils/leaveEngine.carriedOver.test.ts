import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEmployeeUnifiedSummary,
  resolveCarriedOverDays,
  sumCarriedOverFromAllocations,
  sumCompensatoryFromAllocations,
} from './leaveEngine.ts';
import type { Employee, HrLeaveAllocation } from '../types.ts';

const emp = {
  id: 'EMP-1',
  companyId: 'tenant_1',
  nameAr: 'موظف',
  nameEn: 'Emp',
} as Employee;

test('sumCarriedOverFromAllocations includes carried_over rows', () => {
  const allocations = [
    {
      id: 'opening-balance-tenant_1-EMP-1',
      employeeId: 'EMP-1',
      companyId: 'tenant_1',
      allocationType: 'carried_over',
      numberOfDays: 12,
      state: 'validate',
      name: 'رصيد افتتاحي مرحل',
      dateFrom: '2026-01-01',
      leaveType: 'ANNUAL',
    },
  ] as HrLeaveAllocation[];
  assert.equal(sumCarriedOverFromAllocations(emp, allocations), 12);
});

test('resolveCarriedOverDays uses allocations when employee scalar is unset', () => {
  const allocations = [
    {
      id: 'a1',
      employeeId: 'EMP-1',
      allocationType: 'carried_over',
      numberOfDays: 8,
      state: 'validate',
      leaveType: 'ANNUAL',
    },
  ] as HrLeaveAllocation[];
  assert.equal(resolveCarriedOverDays(emp, allocations), 8);
});

test('resolveCarriedOverDays prefers explicit employee field over allocations', () => {
  const withField = { ...emp, carriedOverLeave2025: 5 } as Employee;
  const allocations = [
    {
      id: 'a1',
      employeeId: 'EMP-1',
      allocationType: 'carried_over',
      numberOfDays: 20,
      state: 'validate',
      leaveType: 'ANNUAL',
    },
  ] as HrLeaveAllocation[];
  assert.equal(resolveCarriedOverDays(withField, allocations), 5);
});

test('sumCompensatoryFromAllocations sums every compensatory allocation row', () => {
  const allocations = [
    {
      id: 'c1',
      employeeId: 'EMP-1',
      companyId: 'tenant_1',
      leaveType: 'COMPENSATORY',
      allocationType: 'compensatory_off',
      numberOfDays: 1,
      state: 'validate',
      name: 'عطلة 1',
      dateFrom: '2026-01-01',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'c2',
      employeeId: 'EMP-1',
      companyId: 'tenant_1',
      leaveType: 'COMPENSATORY',
      allocationType: 'compensatory_off',
      numberOfDays: 1,
      state: 'validate',
      name: 'عطلة 2',
      dateFrom: '2026-01-01',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'c3',
      employeeId: 'EMP-1',
      companyId: 'tenant_1',
      leaveType: 'COMPENSATORY',
      allocationType: 'compensatory_off',
      numberOfDays: 1,
      state: 'validate',
      name: 'عطلة 3',
      dateFrom: '2026-02-01',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'c4',
      employeeId: 'EMP-1',
      companyId: 'tenant_1',
      leaveType: 'COMPENSATORY',
      allocationType: 'compensatory_off',
      numberOfDays: 1,
      state: 'validate',
      name: 'عطلة 4',
      dateFrom: '2026-02-01',
      createdAt: '2026-02-02T00:00:00.000Z',
    },
  ] as HrLeaveAllocation[];
  assert.equal(sumCompensatoryFromAllocations(emp, allocations), 4);
});

test('getEmployeeUnifiedSummary uses live accrual instead of stale accruedAnnualLeave', () => {
  const employee = {
    ...emp,
    joinDate: '2026-01-01',
    accruedAnnualLeave: 17.5,
    fullNameAr: 'موظف',
    fullNameEn: 'Emp',
    civilId: '1',
    employeeCode: 'E1',
    status: 'ACTIVE',
  } as Employee;
  const summary = getEmployeeUnifiedSummary(employee, [], []);
  assert.notEqual(summary.accruedAnnualDays, 17.5);
  assert.ok(summary.accruedAnnualDays > 17.5);
});
