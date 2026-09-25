/**
 * One-time / batch: sync employee profile fields → Firestore `documents` archive.
 *
 * Usage:
 *   npx tsx scripts/sync-employee-documents-archive.ts
 *   npx tsx scripts/sync-employee-documents-archive.ts --dry-run
 *   npx tsx scripts/sync-employee-documents-archive.ts --company comp-1788442584841
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';
import {
  buildEmployeeArchiveDocuments,
} from '../src/services/employeeDocumentArchiveSync.ts';

const DEFAULT_COMPANY_IDS = [
  'comp-1788442584841', // المنار
  'tenant_1788413304890', // الفنار
  'comp-1788435917695', // إيليت
  'comp-alfanar', // alias slug (legacy)
];

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const idx = argv.indexOf('--company');
  const companyFilter =
    idx >= 0 && argv[idx + 1] ? [argv[idx + 1]] : DEFAULT_COMPANY_IDS;
  return { dryRun, companyFilter };
}

async function main() {
  const { dryRun, companyFilter } = parseArgs();
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');
  }

  const seenEmployeeIds = new Set<string>();
  let employeesProcessed = 0;
  let documentsWritten = 0;

  for (const companyId of companyFilter) {
    const [byCompanyId, byLegacyCompanyId] = await Promise.all([
      db.collection('employees').where('companyId', '==', companyId).get(),
      db.collection('employees').where('company_id', '==', companyId).get(),
    ]);
    const employeeDocs = new Map<string, (typeof byCompanyId.docs)[number]>();
    for (const d of [...byCompanyId.docs, ...byLegacyCompanyId.docs]) {
      employeeDocs.set(d.id, d);
    }
    console.log(`\n=== ${companyId} (${employeeDocs.size} employees) ===`);

    for (const docSnap of employeeDocs.values()) {
      const employee = { id: docSnap.id, ...docSnap.data() } as Record<string, unknown>;
      if (seenEmployeeIds.has(employee.id as string)) continue;
      seenEmployeeIds.add(employee.id as string);

      const rows = buildEmployeeArchiveDocuments(employee);
      if (rows.length === 0) {
        continue;
      }

      employeesProcessed += 1;
      for (const row of rows) {
        documentsWritten += 1;
        if (dryRun) {
          console.log('[dry-run]', row.id, row.title, row.expiryDate || '—');
        } else {
          await db.collection('documents').doc(row.id).set(cleanFirestoreData(row), { merge: true });
        }
      }
    }
  }

  console.log(
    `\nDone. employees=${employeesProcessed} documentRows=${documentsWritten}${dryRun ? ' (dry-run)' : ''}`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
