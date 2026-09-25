/**
 * Move one employee doc to another company (updates companyId + related refs where safe).
 * Usage: npx tsx scripts/move-employee-to-company.ts <employeeDocId> <targetCompanyId> [--dry-run]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const employeeDocId = process.argv[2];
const targetCompanyId = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

async function main() {
  if (!employeeDocId || !targetCompanyId) {
    throw new Error('Usage: npx tsx scripts/move-employee-to-company.ts <employeeDocId> <targetCompanyId> [--dry-run]');
  }

  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const empRef = db.collection('employees').doc(employeeDocId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) throw new Error(`Employee not found: ${employeeDocId}`);

  const emp = empSnap.data()!;
  const fromCompanyId = String(emp.companyId || '');
  const civilId = String(emp.civilId || emp.civil_id || '').trim();

  const targetCompany = await db.collection('companies').doc(targetCompanyId).get();
  if (!targetCompany.exists) {
    throw new Error(`Target company missing: ${targetCompanyId}`);
  }

  if (civilId) {
    const dup = await db
      .collection('employees')
      .where('civilId', '==', civilId)
      .get();
    const others = dup.docs.filter((d) => d.id !== employeeDocId && String(d.data().companyId) === targetCompanyId);
    if (others.length > 0) {
      throw new Error(
        `Duplicate civil ${civilId} already at target: ${others.map((d) => d.id).join(', ')}`
      );
    }
  }

  console.log('Move plan:', {
    employeeDocId,
    name: emp.fullNameAr || emp.nameAr || emp.name,
    civilId,
    fromCompanyId,
    toCompanyId: targetCompanyId,
    toCompanyName: targetCompany.data()?.nameAr || targetCompany.data()?.name,
    dryRun,
  });

  if (dryRun) return;

  const now = new Date().toISOString();
  await empRef.set(
    {
      companyId: targetCompanyId,
      updatedAt: now,
    },
    { merge: true }
  );

  const batchCollections = [
    'leave_allocations',
    'leave_requests',
    'attendance_records',
    'loans',
    'payslips',
    'onboarding_plans',
  ] as const;

  for (const col of batchCollections) {
    const q = await db.collection(col).where('employeeId', '==', employeeDocId).get();
    let moved = 0;
    for (const doc of q.docs) {
      const data = doc.data();
      if (String(data.companyId || '') !== fromCompanyId) continue;
      await doc.ref.set({ companyId: targetCompanyId, updatedAt: now }, { merge: true });
      moved++;
    }
    if (moved > 0) console.log(`Updated ${moved} in ${col}`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
