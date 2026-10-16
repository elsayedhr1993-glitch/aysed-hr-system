import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateEmployeePayroll, calculateKuwaitEOS } from './kuwaitPayrollEngine.ts';
import {
  calculateKuwaitDailyRate,
  calculateKuwaitLeaveCashAmount,
  computeNetPayrollFromComponents,
} from './kuwaitPayrollMath.ts';
import { computeAccrual2026Unified } from './leaveAccrual2026.ts';
import {
  calculateUniversalLeaveSettlement,
  calculateWorkingLeaveDays,
  resolveNetAvailableLeaveBalance,
} from '../services/leaveSettlementService.ts';

// TODO: مراجعة قانونية ومحاسبية.
// الأرقام أدناه مرجع ثابت لمخرجات المعادلات الحالية. ليست اعتماداً قانونياً أو محاسبياً.

const employee = {
  id: 'emp-edge',
  name: 'Edge',
  civilId: '200000000001',
  jobTitle: 'x',
  department: 'x',
  basicSalary: 520,
  housingAllowance: 80,
  transportAllowance: 20,
  medicalAllowance: 0,
  isKuwaiti: false,
  bankName: '',
  iban: '',
  contractStatus: 'running' as const,
};

const settlementBase = {
  companyId: 'comp-a',
  employeeId: 'emp-edge',
  settlementDate: '2026-10-16',
  basicSalary: 520,
  allowances: 100,
  grossSalary: 620,
  dailyWage: 0,
  hourlyWage: 0,
  carriedOverBalance: 8,
  accruedBalance: 4.5,
  totalAvailableBalance: 12.5,
  requestedLeaveDays: 20,
  statutoryLeaveDays: 3,
  consumedLeaveDays: 10,
  unpaidLeaveDays: 2,
  includeProratedSalary: true,
  workedDaysInMonth: 12,
  proratedSalaryDivisor: 26,
  includeOvertime: true,
  overtimeHours: 3,
  overtimeMultiplier: 1.25,
  includeEncashment: true,
  encashmentDays: 6,
  ticketAllowance: 25,
  housingAllowance: 0,
  loanDeduction: 15,
  salaryAdvanceDeduction: 0,
  adminDeduction: 1.5,
  customItems: [],
  paymentMethod: 'BANK_TRANSFER' as const,
};

test('TODO legal/accounting: leave edges stay on the current engine output', () => {
  assert.equal(calculateKuwaitDailyRate(0), 0);
  assert.equal(calculateKuwaitDailyRate(-10), 0);
  assert.equal(calculateKuwaitLeaveCashAmount(0, 520), 0);
  assert.equal(calculateKuwaitLeaveCashAmount(-3, 520), 0);
  assert.equal(calculateKuwaitLeaveCashAmount(0.5, 520), 10);
  assert.equal(computeAccrual2026Unified('2025-01-01', new Date('2025-12-31')), 0);
  assert.equal(computeAccrual2026Unified('2026-11-01', new Date('2026-10-16')), 0);
  assert.equal(computeAccrual2026Unified('', new Date('2026-01-01')), 0.08);
  assert.equal(computeAccrual2026Unified('2026-01-01', new Date('2026-01-31'), {
    employeeId: 'E',
    leaves: [{
      employeeId: 'E',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      totalDays: 31,
      leaveType: 'annual',
      status: 'APPROVED',
    }],
  }), 0);
  assert.equal(resolveNetAvailableLeaveBalance({ totalBalance: 4, approvedLeaveDeductionDays: 9 }), 0);
  assert.equal(resolveNetAvailableLeaveBalance({}), 0);
  assert.deepEqual(calculateWorkingLeaveDays('', '2026-10-16'), {
    totalDays: 0,
    fridaysCount: 0,
    workingDays: 0,
  });
  assert.deepEqual(calculateWorkingLeaveDays('2026-10-20', '2026-10-16'), {
    totalDays: 0,
    fridaysCount: 0,
    workingDays: 0,
  });
  assert.deepEqual(calculateWorkingLeaveDays('2026-10-16', '2026-10-16'), {
    totalDays: 1,
    fridaysCount: 1,
    workingDays: 0,
  });
});

test('TODO legal/accounting: payroll edges stay on the current engine output', () => {
  assert.deepEqual(calculateEmployeePayroll(employee, {}), {
    employeeId: 'emp-edge',
    grossSalary: 620,
    basicSalary: 520,
    allowances: 100,
    unpaidAbsenceDays: 0,
    absenceDeduction: 0,
    delayMinutes: 0,
    delayDeduction: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    netSalary: 620,
  });

  const floored = calculateEmployeePayroll(employee, {
    unpaidAbsenceDays: 40,
    delayMinutes: 600,
    overtimeHours: 0,
  });
  assert.equal(floored.absenceDeduction, 953.8461538461538);
  assert.equal(floored.delayDeduction, 29.807692307692307);
  assert.equal(floored.netSalary, 0);

  const mixed = calculateEmployeePayroll(employee, {
    overtimeHours: 8,
    delayMinutes: 30,
    unpaidAbsenceDays: 1,
  });
  assert.equal(mixed.absenceDeduction, 23.846153846153847);
  assert.equal(mixed.delayDeduction, 1.4903846153846154);
  assert.equal(mixed.overtimeAmount, 29.807692307692307);
  assert.equal(mixed.netSalary, 624.4711538461538);

  const zeroWage = calculateEmployeePayroll({
    ...employee,
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
  }, { overtimeHours: 4 });
  assert.equal(zeroWage.grossSalary, 0);
  assert.equal(zeroWage.overtimeAmount, 0);
  assert.equal(zeroWage.netSalary, 0);

  assert.deepEqual(computeNetPayrollFromComponents({
    grossSalary: 400,
    overtimeAmount: 10.5,
    bonusAmount: 0,
    absenceDeduction: 500,
    delayDeduction: 1.25,
    loanDeduction: 20,
    otherDeductions: 3,
  }), { totalDeductions: 524.25, netSalary: 0 });
});

test('TODO legal/accounting: end-of-service edges stay on the current engine output', () => {
  const resignUnder3 = calculateKuwaitEOS({
    employeeId: 'e',
    employeeName: 'n',
    civilId: '200000000001',
    joinDate: '2024-01-01',
    leaveDate: '2026-06-01',
    grossSalary: 780,
    terminationType: 'RESIGNATION',
    contractType: 'INDEFINITE',
    unusedLeaveDays: 12,
    otherDeductions: 50,
    totalUnpaidLeaveDays: 40,
  });
  assert.equal(resignUnder3.article53Ratio, 0);
  assert.equal(resignUnder3.netEosAmount, 0);
  assert.equal(resignUnder3.grossEosAmount, 1037.3716632443532);
  assert.equal(resignUnder3.leavePayoutAmount, 360);
  assert.equal(resignUnder3.totalSettlement, 310);
  assert.equal(resignUnder3.netServiceDays, 842);

  const resign3to5 = calculateKuwaitEOS({
    employeeId: 'e',
    employeeName: 'n',
    civilId: '200000000001',
    joinDate: '2022-01-01',
    leaveDate: '2026-01-01',
    grossSalary: 650,
    terminationType: 'RESIGNATION',
    contractType: 'FIXED_TERM',
  });
  assert.equal(resign3to5.article53Ratio, 0.5);
  assert.equal(resign3to5.grossEosAmount, 1500);
  assert.equal(resign3to5.netEosAmount, 750);
  assert.equal(resign3to5.totalSettlement, 750);
  assert.equal(resign3to5.netServiceDays, 1461);

  const resign10 = calculateKuwaitEOS({
    employeeId: 'e',
    employeeName: 'n',
    civilId: '200000000001',
    joinDate: '2014-01-01',
    leaveDate: '2026-01-01',
    grossSalary: 900,
    terminationType: 'RESIGNATION',
    contractType: 'INDEFINITE',
  });
  assert.equal(resign10.article53Ratio, 1);
  assert.equal(resign10.grossEosAmount, 8896.153846153846);
  assert.equal(resign10.netEosAmount, 8896.153846153846);
  assert.equal(resign10.totalYears, 12);
  assert.equal(resign10.first5YearsEntitlementDays, 75);
  assert.equal(resign10.after5YearsEntitlementDays, 182);

  const inverted = calculateKuwaitEOS({
    employeeId: 'e',
    employeeName: 'n',
    civilId: '200000000001',
    joinDate: '2026-06-01',
    leaveDate: '2026-01-01',
    grossSalary: 500,
    terminationType: 'TERMINATION',
    contractType: 'INDEFINITE',
    unusedLeaveDays: 5,
    otherDeductions: 9999,
  });
  assert.equal(inverted.grossEosAmount, 0);
  assert.equal(inverted.netServiceDays, 0);
  assert.equal(inverted.leavePayoutAmount, 96.15384615384615);
  assert.equal(inverted.totalSettlement, 0);

  const retirement = calculateKuwaitEOS({
    employeeId: 'e',
    employeeName: 'n',
    civilId: '200000000001',
    joinDate: '2020-03-15',
    leaveDate: '2026-03-15',
    grossSalary: 1000,
    terminationType: 'RETIREMENT',
    contractType: 'FIXED_TERM',
    totalUnpaidLeaveDays: 10,
  });
  assert.equal(retirement.article53Ratio, 1);
  assert.equal(retirement.netServiceDays, 2181);
  assert.equal(retirement.totalYears, 5);
  assert.equal(retirement.grossEosAmount, 3855.867951350497);
  assert.equal(retirement.netEosAmount, 3855.867951350497);
  assert.equal(retirement.first5YearsEntitlementDays, 75);
  assert.equal(retirement.after5YearsEntitlementDays, 25.252566735112936);
});

test('TODO legal/accounting: leave settlement edges stay on the current engine output', () => {
  const settlement = calculateUniversalLeaveSettlement(settlementBase);
  assert.equal(settlement.dailyWage, 20);
  assert.equal(settlement.hourlyWage, 2.5);
  assert.equal(settlement.consumedLeaveDays, 10);
  assert.equal(settlement.encashedLeaveDays, 2.5);
  assert.equal(settlement.remainingBalanceAfter, 0);
  assert.equal(settlement.totalEarnings, 524.375);
  assert.equal(settlement.totalDeductions, 16.5);
  assert.equal(settlement.netSettlementPayout, 507.875);
  assert.equal(settlement.aysed_leave_cash, 250);
  assert.deepEqual(settlement.items.map((item) => ({
    id: item.id,
    amount: item.amount,
    quantity: item.quantity,
  })), [
    { id: 'item-prorated-salary', amount: 240, quantity: 12 },
    { id: 'item-overtime', amount: 9.375, quantity: 3 },
    { id: 'item-statutory-leave', amount: 0, quantity: 3 },
    { id: 'item-consumed-leave', amount: 200, quantity: 10 },
    { id: 'item-leave-encashment', amount: 50, quantity: 2.5 },
    { id: 'item-ticket-allowance', amount: 25, quantity: 1 },
    { id: 'item-loan-deduction', amount: 15, quantity: 1 },
    { id: 'item-admin-deduction', amount: 1.5, quantity: 1 },
  ]);

  const encashOver = calculateUniversalLeaveSettlement({
    ...settlementBase,
    settlementMode: 'ENCASHMENT_LIQUIDATION',
    includeProratedSalary: false,
    includeOvertime: false,
    includeEncashment: true,
    consumedLeaveDays: 0,
    unpaidLeaveDays: 0,
    encashmentDays: 99,
    workedDaysInMonth: 0,
    overtimeHours: 0,
    ticketAllowance: 0,
    loanDeduction: 0,
    adminDeduction: 0,
    statutoryLeaveDays: 0,
  });
  assert.equal(encashOver.encashedLeaveDays, 12.5);
  assert.equal(encashOver.remainingBalanceAfter, 0);
  assert.equal(encashOver.netSettlementPayout, 250);
  assert.deepEqual(encashOver.items.map((item) => item.id), ['item-leave-encashment']);

  const zeroSalary = calculateUniversalLeaveSettlement({
    ...settlementBase,
    basicSalary: 0,
    grossSalary: 0,
    allowances: 0,
    includeProratedSalary: true,
    includeOvertime: true,
    includeEncashment: false,
    consumedLeaveDays: 2,
    unpaidLeaveDays: 0,
    ticketAllowance: 0,
    loanDeduction: 0,
    adminDeduction: 0,
    statutoryLeaveDays: 0,
    workedDaysInMonth: 5,
    overtimeHours: 2,
  });
  assert.equal(zeroSalary.dailyWage, 0);
  assert.equal(zeroSalary.consumedLeaveDays, 2);
  assert.equal(zeroSalary.remainingBalanceAfter, 10.5);
  assert.equal(zeroSalary.totalEarnings, 0);
  assert.equal(zeroSalary.netSettlementPayout, 0);
});
