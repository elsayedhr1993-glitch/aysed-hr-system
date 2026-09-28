/**
 * Remove duplicate encash-leave-* rows (same employee, same totalDays, same calendar day).
 * Keeps the newest doc id by timestamp suffix; deletes older duplicates.
 *
 * Usage:
 *   npx tsx scripts/dedupe-encash-leave-requests-admin.ts --dry-run
 *   npx tsx scripts/dedupe-encash-leave-requests-admin.ts --apply [employeeCode] [companyId]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const dryRun = args.includes('--dry-run') || !apply;
const positional = args.filter((a) => !a.startsWith('--'));
const EMPLOYEE_CODE = positional[0] || 'EMP-2026-6684';
const COMPANY_ID = positional[1] || 'comp-1788442584841';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const empSnap = await db
    .collection('employees')
    .where('companyId', '==', COMPANY_ID)
    .where('employeeCode', '==', EMPLOYEE_CODE)
    .limit(1)
    .get();

  if (empSnap.empty) {
    console.log(JSON.stringify({ ok: false, error: 'employee_not_found', employeeCode: EMPLOYEE_CODE }));
    return;
  }

  const employeeId = empSnap.docs[0].id;
  const leavesSnap = await db
    .collection('leave_requests')
    .where('companyId', '==', COMPANY_ID)
    .where('employeeId', '==', employeeId)
    .get();

  const encash = leavesSnap.docs
    .filter((d) => d.id.startsWith('encash-leave') || String(d.data().reason || '').includes('تصفية نقدية'))
    .map((d) => ({ id: d.id, ...d.data() }));

  const groups = new Map<string, typeof encash>();
  for (const row of encash) {
    const day = String(row.startDate || row.endDate || '').slice(0, 10);
    const days = Number(row.totalDays || 0);
    const key = `${row.employeeId}|${day}|${days}`;
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }

  const toDelete: string[] = [];
  for (const [, list] of groups) {
    if (list.length <= 1) continue;
    const sorted = [...list].sort((a, b) => {
      const ta = Number(String(a.id).replace('encash-leave-', '')) || 0;
      const tb = Number(String(b.id).replace('encash-leave-', '')) || 0;
      return tb - ta;
    });
    for (let i = 1; i < sorted.length; i++) {
      toDelete.push(sorted[i].id);
    }
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          employeeId,
          encash_count: encash.length,
          would_delete: toDelete,
          keep: encash.filter((e) => !toDelete.includes(e.id)).map((e) => e.id),
        },
        null,
        2
      )
    );
    return;
  }

  for (const id of toDelete) {
    await db.collection('leave_requests').doc(id).delete();
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        employeeId,
        deleted: toDelete,
        kept: encash.filter((e) => !toDelete.includes(e.id)).map((e) => e.id),
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
