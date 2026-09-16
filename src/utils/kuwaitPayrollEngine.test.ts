import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateKuwaitEOS } from './kuwaitPayrollEngine.ts';

test('calculateKuwaitEOS pays a full gross monthly salary for each year after five years', () => {
  const result = calculateKuwaitEOS({
    employeeId: 'emp-eos-test',
    employeeName: 'Test Employee',
    civilId: '286010112345',
    joinDate: '2016-01-01',
    leaveDate: '2024-01-01',
    grossSalary: 1000,
    terminationType: 'TERMINATION',
    contractType: 'INDEFINITE',
  });

  assert.ok(Math.abs(result.grossEosAmount - 5884.615384615385) < 0.000001);
  assert.ok(Math.abs(result.netEosAmount - 5884.615384615385) < 0.000001);
});

test('calculateKuwaitEOS applies the eighteen-month cap and article 53 resignation ratio', () => {
  const capped = calculateKuwaitEOS({
    employeeId: 'emp-eos-cap',
    employeeName: 'Test Employee',
    civilId: '286010112345',
    joinDate: '1990-01-01',
    leaveDate: '2026-01-01',
    grossSalary: 1000,
    terminationType: 'TERMINATION',
    contractType: 'INDEFINITE',
  });
  assert.equal(capped.grossEosAmount, 18000);

  const resignation = calculateKuwaitEOS({
    employeeId: 'emp-eos-resignation',
    employeeName: 'Test Employee',
    civilId: '286010112345',
    joinDate: '2016-01-01',
    leaveDate: '2024-01-01',
    grossSalary: 1000,
    terminationType: 'RESIGNATION',
    contractType: 'INDEFINITE',
  });
  assert.equal(resignation.article53Ratio, 2 / 3);
  assert.ok(Math.abs(resignation.netEosAmount - 3923.076923076923) < 0.000001);
});
