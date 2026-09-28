/**
 * Probe Firestore leave_settlements, encash leave_requests, and allocations for one employee.
 * Usage: npx tsx scripts/probe-employee-leave-settlements-admin.ts [employeeCode] [companyId]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const EMPLOYEE_CODE = process.argv[2] || 'EMP-2026-6684';
const COMPANY_ID = process.argv[3] || 'comp-1788442584841';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const employeesSnap = await db
    .collection('employees')
    .where('companyId', '==', COMPANY_ID)
    .where('employeeCode', '==', EMPLOYEE_CODE)
    .limit(5)
    .get();

  const employees = employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const employeeIds = employees.map((e) => String(e.id));

  const settlements: Record<string, unknown>[] = [];
  const byCode = await db.collection('leave_settlements').where('employeeCode', '==', EMPLOYEE_CODE).get();
  byCode.docs.forEach((d) => settlements.push({ id: d.id, ...d.data() }));

  for (const empId of employeeIds) {
    const byEmp = await db.collection('leave_settlements').where('employeeId', '==', empId).get();
    byEmp.docs.forEach((d) => {
      if (!settlements.some((s) => s.id === d.id)) {
        settlements.push({ id: d.id, ...d.data() });
      }
    });
  }

  const encashLeaves: Record<string, unknown>[] = [];
  for (const empId of employeeIds.length ? employeeIds : ['__none__']) {
    if (empId === '__none__') break;
    const leavesSnap = await db
      .collection('leave_requests')
      .where('companyId', '==', COMPANY_ID)
      .where('employeeId', '==', empId)
      .get();
    leavesSnap.docs.forEach((d) => {
      const row = d.data();
      const id = d.id;
      if (id.startsWith('encash-leave') || String(row.reason || '').includes('تصفية نقدية')) {
        encashLeaves.push({ id, ...row });
      }
    });
  }

  const allocations: Record<string, unknown>[] = [];
  for (const empId of employeeIds) {
    const allocSnap = await db
      .collection('leave_allocations')
      .where('companyId', '==', COMPANY_ID)
      .where('employeeId', '==', empId)
      .get();
    allocSnap.docs.forEach((d) => allocations.push({ id: d.id, ...d.data() }));
  }

  const summary = {
    employeeCode: EMPLOYEE_CODE,
    companyId: COMPANY_ID,
    employeesFound: employees.length,
    employees: employees.map((e) => ({
      id: e.id,
      fullNameAr: e.fullNameAr,
      employeeCode: e.employeeCode,
      paid_days_remaining: e.paid_days_remaining,
      carriedOverBalance: e.carriedOverBalance,
    })),
    leave_settlements_count: settlements.length,
    leave_settlements: settlements.map((s) => ({
      id: s.id,
      voucherNumber: s.voucherNumber,
      status: s.status,
      settlementMode: s.settlementMode,
      encashedLeaveDays: s.encashedLeaveDays,
      netSettlementPayout: s.netSettlementPayout,
      createdAt: s.createdAt,
    })),
    encash_leave_requests_count: encashLeaves.length,
    encash_leave_requests: encashLeaves,
    leave_allocations: allocations.map((a) => ({
      id: a.id,
      numberOfDays: a.numberOfDays,
      consumedDays: a.consumedDays,
      encashedDays: a.encashedDays,
      remainingDays: a.remainingDays,
      notes: typeof a.notes === 'string' ? a.notes.slice(-120) : a.notes,
    })),
    diagnosis:
      settlements.length === 0 && encashLeaves.length > 0
        ? 'BALANCE_LIQUIDATED_WITHOUT_SETTLEMENT_VOUCHER'
        : settlements.length > 0
          ? 'SETTLEMENT_VOUCHER_EXISTS'
          : 'NO_SETTLEMENT_AND_NO_ENCASH_RECORD',
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
