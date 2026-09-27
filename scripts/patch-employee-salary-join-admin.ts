/**
 * Patch employee salary + join/commencement dates and sync contract.
 * Usage: npx tsx scripts/patch-employee-salary-join-admin.ts <employeeId> <companyId>
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const employeeId = process.argv[2] || 'EMP-2026-002';
const companyId = process.argv[3] || 'comp-1788442584841';

const basicSalary = 800;
const joinDate = '2023-06-01';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const empRef = db.collection('employees').doc(employeeId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) throw new Error(`Employee not found: ${employeeId}`);

  const now = new Date().toISOString();
  const totalSalary = basicSalary;

  await empRef.set(
    {
      basicSalary,
      contractSalary: basicSalary,
      housingAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowance: 0,
      otherAllowances: 0,
      allowances: 0,
      hasAllowances: false,
      salaryPackageType: 'FIXED_NO_ALLOWANCES',
      totalSalary,
      salary: totalSalary,
      payrollNotes: 'راتب ثابت 800 د.ك بدون بدلات',
      joinDate,
      hireDate: joinDate,
      contractStartDate: joinDate,
      commencementDate: joinDate,
      actualJoiningDate: joinDate,
      updatedAt: now,
    },
    { merge: true }
  );

  const contractId = `contract-${companyId}-${employeeId}`;
  const contractRef = db.collection('contracts').doc(contractId);
  if ((await contractRef.get()).exists) {
    await contractRef.set(
      {
        basicSalary,
        housingAllowance: 0,
        transportAllowance: 0,
        medicalAllowance: 0,
        otherAllowance: 0,
        hasAllowances: false,
        salaryPackageType: 'FIXED_NO_ALLOWANCES',
        startDate: joinDate,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const commencementId = `commencement-${companyId}-${employeeId}`;
  const commRef = db.collection('commencements').doc(commencementId);
  if ((await commRef.get()).exists) {
    await commRef.set(
      {
        actualJoiningDate: joinDate,
        commencementDate: joinDate,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const leaveSnap = await db
    .collection('leave_allocations')
    .where('employeeId', '==', employeeId)
    .where('companyId', '==', companyId)
    .get();

  for (const doc of leaveSnap.docs) {
    const data = doc.data();
    if (data.contractStartDate || data.accrualStartDate) {
      await doc.ref.set(
        {
          contractStartDate: joinDate,
          accrualStartDate: joinDate,
          updatedAt: now,
        },
        { merge: true }
      );
    }
  }

  console.log(
    JSON.stringify(
      { ok: true, employeeId, basicSalary, joinDate, totalSalary, contractId, commencementId },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
