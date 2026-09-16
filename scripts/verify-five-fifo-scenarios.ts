import { getEmployeeUnifiedSummary } from '../src/utils/leaveEngine';

const scenarios = [
  {
    name: 'Case 1 - Carried + standard accrual is counted',
    employee: {
      id: 'emp-s1',
      employeeCode: 'EMP-S1',
      fullNameAr: 'موظف 1',
      name: 'موظف 1',
      companyId: 'comp-1',
      civilId: '111111111111',
      joinDate: '2023-01-01',
      basicSalary: 800,
      carriedOverBalance: 7.5,
    },
    allocations: [
      { id: 'a1', employeeId: 'emp-s1', leaveType: 'ANNUAL', allocationType: 'regular', numberOfDays: 7.5, consumedDays: 0, dateFrom: '2025-12-31', state: 'validate', name: 'carried' },
    ],
    leaves: [
      { id: 'l1', employeeId: 'emp-s1', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-06-22', endDate: '2026-06-25', totalDays: 4, paidDays: 4 },
    ],
    assert: (summary: any) => {
      if (summary.usedLeaveDays !== 4) throw new Error(`Case 1 usedLeaveDays expected 4 got ${summary.usedLeaveDays}`);
      if (summary.consumedFromCarried !== 4) throw new Error(`Case 1 consumedFromCarried expected 4 got ${summary.consumedFromCarried}`);
      if (summary.totalAvailableDays <= 0) throw new Error(`Case 1 totalAvailableDays must be positive got ${summary.totalAvailableDays}`);
      if ((summary.consumedFromCarried + summary.consumedFromAccrued + summary.consumedFromComp) !== summary.usedLeaveDays) {
        throw new Error(`Case 1 consumption mismatch: ${summary.consumedFromCarried} + ${summary.consumedFromAccrued} + ${summary.consumedFromComp} !== ${summary.usedLeaveDays}`);
      }
    },
  },
  {
    name: 'Case 2 - Accrued only',
    employee: {
      id: 'emp-s2',
      employeeCode: 'EMP-S2',
      fullNameAr: 'موظف 2',
      name: 'موظف 2',
      companyId: 'comp-1',
      civilId: '222222222222',
      joinDate: '2023-01-01',
      basicSalary: 800,
      carriedOverBalance: 0,
    },
    allocations: [
      { id: 'a2', employeeId: 'emp-s2', leaveType: 'ANNUAL', allocationType: 'accrual', numberOfDays: 20, consumedDays: 0, dateFrom: '2026-01-01', state: 'validate', name: 'accrued' },
    ],
    leaves: [
      { id: 'l2', employeeId: 'emp-s2', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-07-01', endDate: '2026-07-12', totalDays: 12, paidDays: 12 },
    ],
    assert: (summary: any) => {
      if (summary.usedLeaveDays !== 12) throw new Error(`Case 2 usedLeaveDays expected 12 got ${summary.usedLeaveDays}`);
      if (summary.consumedFromAccrued !== 12) throw new Error(`Case 2 consumedFromAccrued expected 12 got ${summary.consumedFromAccrued}`);
      if ((summary.consumedFromCarried + summary.consumedFromAccrued + summary.consumedFromComp) !== summary.usedLeaveDays) {
        throw new Error(`Case 2 consumption mismatch: ${summary.consumedFromCarried} + ${summary.consumedFromAccrued} + ${summary.consumedFromComp} !== ${summary.usedLeaveDays}`);
      }
    },
  },
  {
    name: 'Case 3 - Full FIFO waterfall',
    employee: {
      id: 'emp-fifo',
      employeeCode: 'EMP-FIFO',
      fullNameAr: 'فؤاد نصر عبدالکريم الحجوج',
      name: 'فؤاد نصر عبدالکريم الحجوج',
      companyId: 'comp-1',
      civilId: '284082903269',
      joinDate: '2023-06-01',
      basicSalary: 800,
      carriedOverBalance: 7.5,
    },
    allocations: [
      { id: 'a1', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'regular', numberOfDays: 7.5, consumedDays: 0, dateFrom: '2025-12-31', state: 'validate', name: 'carried' },
      { id: 'a2', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'accrual', numberOfDays: 20, consumedDays: 0, dateFrom: '2026-01-01', state: 'validate', name: 'accrued' },
      { id: 'a3', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'compensatory_off', numberOfDays: 3, consumedDays: 0, dateFrom: '2026-06-01', state: 'validate', name: 'تعويضي' },
    ],
    leaves: [
      { id: 'l1', employeeId: 'emp-fifo', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-06-22', endDate: '2026-06-26', totalDays: 5, paidDays: 5 },
      { id: 'l2', employeeId: 'emp-fifo', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-08-08', endDate: '2026-08-27', totalDays: 16, paidDays: 16 },
    ],
    assert: (summary: any) => {
      if (summary.usedLeaveDays !== 21) throw new Error(`Case 3 usedLeaveDays expected 21 got ${summary.usedLeaveDays}`);
      if (summary.consumedFromCarried !== 7.5) throw new Error(`Case 3 consumedFromCarried expected 7.5 got ${summary.consumedFromCarried}`);
      if (summary.consumedFromAccrued !== 13.5) throw new Error(`Case 3 consumedFromAccrued expected 13.5 got ${summary.consumedFromAccrued}`);
      if (summary.remainingComp !== 3) throw new Error(`Case 3 remainingComp expected 3 got ${summary.remainingComp}`);
      if (summary.totalAvailableDays !== 9.5) throw new Error(`Case 3 totalAvailableDays expected 9.5 got ${summary.totalAvailableDays}`);
    },
  },
  {
    name: 'Case 4 - Returned leave counts as consumed',
    employee: {
      id: 'emp-s4',
      employeeCode: 'EMP-S4',
      fullNameAr: 'موظف 4',
      name: 'موظف 4',
      companyId: 'comp-1',
      civilId: '444444444444',
      joinDate: '2022-01-01',
      basicSalary: 900,
      carriedOverBalance: 3,
    },
    allocations: [
      { id: 'a4', employeeId: 'emp-s4', leaveType: 'ANNUAL', allocationType: 'regular', numberOfDays: 3, consumedDays: 0, dateFrom: '2025-12-31', state: 'validate', name: 'carried' },
      { id: 'a5', employeeId: 'emp-s4', leaveType: 'ANNUAL', allocationType: 'accrual', numberOfDays: 10, consumedDays: 0, dateFrom: '2026-01-01', state: 'validate', name: 'accrued' },
    ],
    leaves: [
      { id: 'l3', employeeId: 'emp-s4', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-05-01', endDate: '2026-05-03', totalDays: 3, paidDays: 3 },
    ],
    assert: (summary: any) => {
      if (summary.usedLeaveDays !== 3) throw new Error(`Case 4 usedLeaveDays expected 3 got ${summary.usedLeaveDays}`);
      if (summary.consumedFromCarried !== 3) throw new Error(`Case 4 consumedFromCarried expected 3 got ${summary.consumedFromCarried}`);
      if (summary.remainingCarried < 0) throw new Error(`Case 4 remainingCarried cannot be negative got ${summary.remainingCarried}`);
      if ((summary.consumedFromCarried + summary.consumedFromAccrued + summary.consumedFromComp) !== summary.usedLeaveDays) {
        throw new Error(`Case 4 consumption mismatch: ${summary.consumedFromCarried} + ${summary.consumedFromAccrued} + ${summary.consumedFromComp} !== ${summary.usedLeaveDays}`);
      }
    },
  },
  {
    name: 'Case 5 - PENDING leaves do not consume balance',
    employee: {
      id: 'emp-s5',
      employeeCode: 'EMP-S5',
      fullNameAr: 'موظف 5',
      name: 'موظف 5',
      companyId: 'comp-1',
      civilId: '555555555555',
      joinDate: '2021-01-01',
      basicSalary: 1000,
      carriedOverBalance: 5,
    },
    allocations: [
      { id: 'a6', employeeId: 'emp-s5', leaveType: 'ANNUAL', allocationType: 'regular', numberOfDays: 5, consumedDays: 0, dateFrom: '2025-12-31', state: 'validate', name: 'carried' },
      { id: 'a7', employeeId: 'emp-s5', leaveType: 'ANNUAL', allocationType: 'accrual', numberOfDays: 15, consumedDays: 0, dateFrom: '2026-01-01', state: 'validate', name: 'accrued' },
      { id: 'a8', employeeId: 'emp-s5', leaveType: 'ANNUAL', allocationType: 'compensatory_off', numberOfDays: 2, consumedDays: 0, dateFrom: '2026-06-01', state: 'validate', name: 'تعويضي' },
    ],
    leaves: [
      { id: 'l4', employeeId: 'emp-s5', leaveType: 'ANNUAL', status: 'APPROVED', startDate: '2026-02-05', endDate: '2026-02-08', totalDays: 4, paidDays: 4 },
      { id: 'l5', employeeId: 'emp-s5', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-04-01', endDate: '2026-04-06', totalDays: 6, paidDays: 6 },
      { id: 'l6', employeeId: 'emp-s5', leaveType: 'ANNUAL', status: 'PENDING', startDate: '2026-07-05', endDate: '2026-07-10', totalDays: 6, paidDays: 6 },
    ],
    assert: (summary: any) => {
      if (summary.usedLeaveDays !== 10) throw new Error(`Case 5 usedLeaveDays expected 10 got ${summary.usedLeaveDays}`);
      if (summary.consumedFromCarried + summary.consumedFromAccrued + summary.consumedFromComp !== 10) {
        throw new Error(`Case 5 bucket sum expected 10 got ${summary.consumedFromCarried + summary.consumedFromAccrued + summary.consumedFromComp}`);
      }
      if (summary.totalAvailableDays <= 0) throw new Error(`Case 5 totalAvailableDays must be positive got ${summary.totalAvailableDays}`);
    },
  },
];

for (const scenario of scenarios) {
  const summary = getEmployeeUnifiedSummary(scenario.employee as any, scenario.allocations as any, scenario.leaves as any);
  try {
    scenario.assert(summary);
    console.log(`\n${scenario.name} PASS`);
    console.log(JSON.stringify({
      usedLeaveDays: summary.usedLeaveDays,
      totalAvailableDays: summary.totalAvailableDays,
      consumedFromCarried: summary.consumedFromCarried,
      consumedFromAccrued: summary.consumedFromAccrued,
      consumedFromComp: summary.consumedFromComp,
      remainingCarried: summary.remainingCarried,
      remainingAccrued: summary.remainingAccrued,
      remainingComp: summary.remainingComp,
    }, null, 2));
  } catch (error: any) {
    console.error(`\n${scenario.name} FAILED`);
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error('\nOne or more FIFO scenarios failed.');
} else {
  console.log('\nAll FIFO scenario checks passed.');
}
