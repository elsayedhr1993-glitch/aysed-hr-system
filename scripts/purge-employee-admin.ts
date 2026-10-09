/**
 * Purge one employee doc and related Firestore rows (Admin SDK).
 * Usage:
 *   npx tsx scripts/purge-employee-admin.ts EMP-2026-2617 [--dry-run]
 */
import 'dotenv/config';
import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const employeeId = String(process.argv[2] || '').trim();
const dryRun = process.argv.includes('--dry-run');

const REL_COLS = [
  'contracts',
  'commencements',
  'leave_requests',
  'leave_allocations',
  'attendance',
  'payslips',
  'loans',
  'documents',
  'employee_lifecycle_events',
  'employeeNotes',
  'warnings',
  'work_on_holidays',
  'onboarding_plans',
  'leave_settlements',
];

async function deleteDocSafe(db: Firestore, path: string, deleted: string[]) {
  const ref = db.doc(path);
  const snap = await ref.get();
  if (!snap.exists) return;
  if (!dryRun) await ref.delete();
  deleted.push(path);
}

async function main() {
  if (!employeeId) {
    console.error('Usage: npx tsx scripts/purge-employee-admin.ts <employeeId> [--dry-run]');
    process.exit(1);
  }

  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const empRef = db.collection('employees').doc(employeeId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) {
    console.log(JSON.stringify({ employeeId, status: 'not_found' }, null, 2));
    return;
  }

  const empData = empSnap.data() as Record<string, unknown>;
  const deletedPaths: string[] = [];

  for (const col of REL_COLS) {
    const snap = await db.collection(col).where('employeeId', '==', employeeId).get();
    for (const d of snap.docs) {
      if (!dryRun) await d.ref.delete();
      deletedPaths.push(`${col}/${d.id}`);
    }
  }

  const legacyContractIds = [
    `contract-${employeeId}`,
    `contract-comp-elite-${employeeId}`,
    `contract-comp-1788435917695-${employeeId}`,
  ];
  for (const id of legacyContractIds) {
    await deleteDocSafe(db, `contracts/${id}`, deletedPaths);
  }

  const legacyCommencementIds = [`commencement-${employeeId}`, `commencement-comp-elite-${employeeId}`];
  for (const id of legacyCommencementIds) {
    await deleteDocSafe(db, `commencements/${id}`, deletedPaths);
  }

  if (!dryRun) await empRef.delete();
  deletedPaths.push(`employees/${employeeId}`);

  console.log(
    JSON.stringify(
      {
        dryRun,
        purgedEmployeeId: employeeId,
        purgedName: empData.fullNameAr || empData.nameAr,
        purgedCivilId: empData.civilId,
        purgedCompanyId: empData.companyId,
        deletedPaths,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
