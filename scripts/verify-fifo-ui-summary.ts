import { getEmployeeUnifiedSummary } from '../src/utils/leaveEngine';

const employee: any = {
  id: 'emp-fifo',
  employeeCode: 'EMP-FIFO',
  fullNameAr: 'فؤاد نصر عبدالکريم الحجوج',
  name: 'فؤاد نصر عبدالکريم الحجوج',
  companyId: 'comp-1',
  civilId: '284082903269',
  joinDate: '2023-06-01',
  basicSalary: 800,
  carriedOverBalance: 7.5
};

const allocations: any[] = [
  { id: 'a1', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'regular', numberOfDays: 7.5, consumedDays: 0, dateFrom: '2025-12-31', state: 'validate', name: 'carried' },
  { id: 'a2', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'accrual', numberOfDays: 20, consumedDays: 0, dateFrom: '2026-01-01', state: 'validate', name: 'accrued' },
  { id: 'a3', employeeId: 'emp-fifo', leaveType: 'ANNUAL', allocationType: 'compensatory_off', numberOfDays: 3, consumedDays: 0, dateFrom: '2026-06-01', state: 'validate', name: 'تعويضي' }
];

const leaves: any[] = [
  { id: 'l1', employeeId: 'emp-fifo', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-06-22', endDate: '2026-06-26', totalDays: 5, paidDays: 5 },
  { id: 'l2', employeeId: 'emp-fifo', leaveType: 'ANNUAL', status: 'RETURNED', startDate: '2026-08-08', endDate: '2026-08-27', totalDays: 16, paidDays: 16 }
];

const summary = getEmployeeUnifiedSummary(employee, allocations as any, leaves as any);
console.log(JSON.stringify(summary, null, 2));

if (summary.usedLeaveDays !== 21) throw new Error(`Expected usedLeaveDays=21 got ${summary.usedLeaveDays}`);
if (summary.totalAvailableDays !== 9.5) throw new Error(`Expected totalAvailableDays=9.5 got ${summary.totalAvailableDays}`);
if (summary.consumedFromCarried !== 7.5) throw new Error(`Expected consumedFromCarried=7.5 got ${summary.consumedFromCarried}`);
if (summary.consumedFromAccrued !== 13.5) throw new Error(`Expected consumedFromAccrued=13.5 got ${summary.consumedFromAccrued}`);
if (summary.consumedFromComp !== 0) throw new Error(`Expected consumedFromComp=0 got ${summary.consumedFromComp}`);
if (summary.remainingCarried !== 0) throw new Error(`Expected remainingCarried=0 got ${summary.remainingCarried}`);
if (summary.remainingAccrued !== 6.5) throw new Error(`Expected remainingAccrued=6.5 got ${summary.remainingAccrued}`);
if (summary.remainingComp !== 3) throw new Error(`Expected remainingComp=3 got ${summary.remainingComp}`);
