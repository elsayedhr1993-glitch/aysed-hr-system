/**
 * Submit a 3-day annual leave request for emp-qa-master (QA test cycle).
 *
 * Usage: npx tsx scripts/submit-qa-leave-request.ts
 */
import dotenv from 'dotenv';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { TenantDatabaseService } from '../src/services/tenantDataService';
import { calculateKuwaitDailyRate, calculateKuwaitLeaveCashAmount } from '../src/utils/kuwaitPayrollMath';
import { LeaveRequest } from '../src/types';

dotenv.config();

const COMPANY_ID = 'comp-1788442584841';
const EMPLOYEE_ID = 'emp-qa-master';
const LEAVE_ID = 'LV-QA-TEST-001';

async function main() {
  const empSnap = await getDoc(doc(db, 'employees', EMPLOYEE_ID));
  if (!empSnap.exists()) {
    console.error('❌ QA employee not found. Run: npm run qa:seed');
    process.exit(1);
  }

  const emp = empSnap.data();
  const basicSalary = Number(emp.basicSalary || 780);
  const days = 3;
  const startDate = '2026-09-22';
  const endDate = '2026-09-24';

  const employeeName = String(emp.fullNameAr || '[QA] عبدالله تجريبي — دورة اختبار');
  const leave = {
    id: LEAVE_ID,
    companyId: COMPANY_ID,
    employeeId: EMPLOYEE_ID,
    employeeName,
    leaveType: 'ANNUAL' as const,
    startDate,
    endDate,
    totalDays: days,
    daysCount: days,
    reason: '[QA] اختبار دورة — إجازة سنوية 3 أيام',
    status: 'PENDING_MANAGER' as const,
    appliedDate: new Date().toISOString().split('T')[0],
    basicSalary,
    totalSalary: Number(emp.totalSalary || 950),
    settlementDone: false,
    createdAt: new Date().toISOString(),
  };

  const saved = await TenantDatabaseService.saveLeave(leave as LeaveRequest, COMPANY_ID);
  if (!saved) {
    console.error('❌ Failed to save leave request');
    process.exit(1);
  }

  const dailyRate = calculateKuwaitDailyRate(basicSalary);
  const cashAmount = calculateKuwaitLeaveCashAmount(days, basicSalary);

  console.log('✅ Leave request submitted for QA employee\n');
  console.log(`  ID:          ${LEAVE_ID}`);
  console.log(`  Employee:    ${employeeName}`);
  console.log(`  Type:        ANNUAL`);
  console.log(`  Dates:       ${startDate} → ${endDate}`);
  console.log(`  Days:        ${days}`);
  console.log(`  Status:      PENDING_MANAGER`);
  console.log(`  Daily rate:  ${dailyRate} KWD (780 ÷ 26)`);
  console.log(`  Cash value:  ${cashAmount} KWD (${days} × ${dailyRate})`);
  console.log('\nNext: refresh Time Off app → طلبات الإجازات (should show 1 pending)');
}

main().catch(err => {
  console.error('❌', err?.message || err);
  process.exit(1);
});
