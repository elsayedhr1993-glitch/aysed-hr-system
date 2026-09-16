/**
 * Approve QA leave request LV-QA-TEST-001 (Manager → HR → APPROVED).
 *
 * Usage: npx tsx scripts/approve-qa-leave-request.ts
 */
import dotenv from 'dotenv';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../src/lib/firebase';
import { approveLeaveRequest } from '../src/services/leaveApprovalService';
import { calculateLeaveBalanceSnapshot } from '../src/utils/leaveEngine';
import { calculateKuwaitDailyRate, calculateKuwaitLeaveCashAmount } from '../src/utils/kuwaitPayrollMath';
import { Employee, HrLeaveAllocation, LeaveRequest } from '../src/types';
import { collection, getDocs, query, where } from 'firebase/firestore';

dotenv.config();

const COMPANY_ID = 'comp-1788442584841';
const EMPLOYEE_ID = 'emp-qa-master';
const LEAVE_ID = 'LV-QA-TEST-001';
const APPROVER = 'QA Super Admin — دورة اختبار';

async function main() {
  console.log('=== Approve QA Leave Request ===\n');

  const leaveRef = doc(db, 'leave_requests', LEAVE_ID);
  const leaveSnap = await getDoc(leaveRef);
  if (!leaveSnap.exists()) {
    console.error(`❌ Leave ${LEAVE_ID} not found. Run: npm run qa:leave`);
    process.exit(1);
  }

  const leave = { id: leaveSnap.id, ...leaveSnap.data() } as LeaveRequest & Record<string, unknown>;
  console.log(`Leave:    ${LEAVE_ID}`);
  console.log(`Employee: ${leave.employeeId}`);
  console.log(`Days:     ${leave.totalDays ?? leave.daysCount}`);
  console.log(`Status:   ${leave.status}`);

  if (String(leave.status).toUpperCase() === 'APPROVED') {
    console.log('\n⚠️  Already APPROVED — skipping approval, running verification only.');
  } else {
    // Step 1 — Manager approval: PENDING_MANAGER → PENDING_HR
    if (String(leave.status).toUpperCase() === 'PENDING_MANAGER' || String(leave.status).toUpperCase() === 'SUBMITTED') {
      const now = new Date().toISOString();
      await setDoc(
        leaveRef,
        cleanFirestoreData({
          ...leave,
          status: 'PENDING_HR',
          managerApprovedBy: APPROVER,
          managerApprovedAt: now,
          updatedAt: now,
        }),
        { merge: true }
      );
      console.log('\n✓ Manager approved → PENDING_HR');
    }

    // Step 2 — HR approval (atomic deduct + Supabase sync)
    const result = await approveLeaveRequest(
      {
        id: LEAVE_ID,
        companyId: COMPANY_ID,
        employeeId: EMPLOYEE_ID,
        leaveType: String(leave.leaveType || 'ANNUAL'),
        totalDays: Number(leave.totalDays ?? leave.daysCount ?? 3),
        daysCount: Number(leave.daysCount ?? leave.totalDays ?? 3),
        status: 'PENDING_HR',
      },
      APPROVER
    );

    console.log('✓ HR approved → APPROVED');
    console.log(`  Paid days:      ${result.paidDays}`);
    console.log(`  Unpaid days:    ${result.unpaidDays}`);
    console.log(`  Remaining:      ${result.remainingDays}`);
    console.log(`  Allocations:    ${result.allocationBreakdown.map(a => `${a.allocationId} (−${a.daysUsed})`).join(', ') || 'none'}`);
  }

  // Verification
  const empSnap = await getDoc(doc(db, 'employees', EMPLOYEE_ID));
  const finalLeaveSnap = await getDoc(leaveRef);
  const finalLeave = finalLeaveSnap.data();
  const emp = { id: EMPLOYEE_ID, ...empSnap.data() } as Employee;

  const allocSnap = await getDocs(query(collection(db, 'leave_allocations'), where('companyId', '==', COMPANY_ID)));
  const allocations = allocSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as HrLeaveAllocation))
    .filter(a => String(a.employeeId) === EMPLOYEE_ID);

  const leavesSnap = await getDocs(query(collection(db, 'leave_requests'), where('companyId', '==', COMPANY_ID)));
  const leaves = leavesSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as LeaveRequest))
    .filter(l => String(l.employeeId) === EMPLOYEE_ID);

  const snapshot = calculateLeaveBalanceSnapshot({ employee: emp, allocations, leaves });
  const basic = Number(emp.basicSalary || 780);
  const daily = calculateKuwaitDailyRate(basic);

  console.log('\n=== Post-approval verification ===');
  console.log(`Leave status:     ${finalLeave?.status}`);
  console.log(`Paid / unpaid:    ${finalLeave?.paidDays ?? finalLeave?.aysed_paid_days} / ${finalLeave?.unpaidDays ?? finalLeave?.aysed_unpaid_days}`);
  console.log(`Daily rate:       ${daily} KWD`);
  console.log(`3-day cash value: ${calculateKuwaitLeaveCashAmount(3, basic)} KWD`);
  console.log(`Engine balance:   ${snapshot.netBalance} days`);
  console.log(`Cash liability:   ${snapshot.cashLiability} KWD`);

  if (String(finalLeave?.status).toUpperCase() !== 'APPROVED') {
    console.error('\n❌ Approval did not stick');
    process.exit(1);
  }

  console.log('\n✅ QA leave approval cycle complete.');
}

main().catch(err => {
  console.error('❌', err?.message || err);
  process.exit(1);
});
