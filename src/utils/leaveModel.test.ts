import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeLeaveType, normalizeLeaveStatus, isLeaveRequestInConflict, canTransitionLeaveStatus } from './leaveModel.ts';
import { computeFifoLeaveAllocations } from '../services/leaveService.ts';

test('normalizeLeaveType accepts the mixed leave-type variants used across the app', () => {
  assert.equal(normalizeLeaveType('annual'), 'ANNUAL');
  assert.equal(normalizeLeaveType('annual_leave'), 'ANNUAL');
  assert.equal(normalizeLeaveType('sick'), 'SICK');
  assert.equal(normalizeLeaveType('compensatory'), 'COMPENSATORY');
  assert.equal(normalizeLeaveType('bereavement'), 'BEREAVEMENT');
});

test('normalizeLeaveStatus normalizes workflow states to one canonical set', () => {
  assert.equal(normalizeLeaveStatus('PENDING_MANAGER'), 'PENDING_MANAGER');
  assert.equal(normalizeLeaveStatus('pending manager'), 'PENDING_MANAGER');
  assert.equal(normalizeLeaveStatus('validated'), 'APPROVED');
  assert.equal(normalizeLeaveStatus('rejected'), 'REJECTED');
  assert.equal(normalizeLeaveStatus('draft'), 'DRAFT');
});

test('isLeaveRequestInConflict blocks overlapping active requests for the same employee', () => {
  const existing = [
    { employeeId: 'emp-5', startDate: '2026-09-10', endDate: '2026-09-15', status: 'APPROVED' },
    { employeeId: 'emp-5', startDate: '2026-09-20', endDate: '2026-09-21', status: 'REJECTED' },
  ];

  assert.equal(isLeaveRequestInConflict({ employeeId: 'emp-5', startDate: '2026-09-12', endDate: '2026-09-14', status: 'PENDING_MANAGER' }, existing), true);
  assert.equal(isLeaveRequestInConflict({ employeeId: 'emp-5', startDate: '2026-09-18', endDate: '2026-09-19', status: 'PENDING_MANAGER' }, existing), false);
  assert.equal(isLeaveRequestInConflict({ employeeId: 'emp-9', startDate: '2026-09-12', endDate: '2026-09-14', status: 'PENDING_MANAGER' }, existing), false);
});

test('canTransitionLeaveStatus permits only valid workflow transitions', () => {
  assert.equal(canTransitionLeaveStatus('PENDING_MANAGER', 'PENDING_HR'), true);
  assert.equal(canTransitionLeaveStatus('PENDING_HR', 'APPROVED'), true);
  assert.equal(canTransitionLeaveStatus('APPROVED', 'PENDING_HR'), false);
  assert.equal(canTransitionLeaveStatus('DRAFT', 'APPROVED'), false);
});

test('computeFifoLeaveAllocations uses allocation order and leaves deduction correctly', () => {
  const employee = {
    id: 'emp-1',
    employeeCode: 'E-1',
    companyId: 'comp-main',
    status: 'ACTIVE',
    isDeleted: false,
  } as any;

  const allocations = [
    {
      id: 'alloc-1',
      employeeId: 'emp-1',
      companyId: 'comp-main',
      leaveType: 'ANNUAL',
      allocationType: 'regular',
      numberOfDays: 10,
      consumedDays: 0,
      encashedDays: 0,
      remainingDays: 10,
      dateFrom: '2026-01-01',
      state: 'validate',
      name: 'Opening balance',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'alloc-2',
      employeeId: 'emp-1',
      companyId: 'comp-main',
      leaveType: 'ANNUAL',
      allocationType: 'accrual',
      numberOfDays: 20,
      consumedDays: 0,
      encashedDays: 0,
      remainingDays: 20,
      dateFrom: '2026-06-01',
      state: 'validate',
      name: 'Monthly accrual',
      createdAt: '2026-06-01T00:00:00.000Z',
    },
  ];

  const leaves = [
    {
      id: 'leave-1',
      employeeId: 'emp-1',
      companyId: 'comp-main',
      leaveType: 'ANNUAL',
      startDate: '2026-02-01',
      endDate: '2026-02-05',
      totalDays: 5,
      paidDays: 5,
      status: 'APPROVED',
      isHistorical: false,
    },
    {
      id: 'leave-2',
      employeeId: 'emp-1',
      companyId: 'comp-main',
      leaveType: 'ANNUAL',
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      totalDays: 7,
      paidDays: 7,
      status: 'APPROVED',
      isHistorical: false,
    },
  ] as any;

  const result = computeFifoLeaveAllocations(employee, allocations as any, leaves);

  assert.equal(result.netAvailable, 18);
  assert.equal(result.breakdown.length, 2);
  assert.equal(result.breakdown[0].paidDays, 5);
  assert.equal(result.breakdown[1].paidDays, 7);
});
