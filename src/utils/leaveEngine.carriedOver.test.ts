import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCarriedOverDays, sumCarriedOverFromAllocations } from './leaveEngine.ts';
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
