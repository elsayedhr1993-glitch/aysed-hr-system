/**
 * Remove demo / QA seed data from Firestore across HR modules.
 *
 * Usage:
 *   npx tsx scripts/purge-demo-qa-data.ts
 *   npx tsx scripts/purge-demo-qa-data.ts --dry-run
 */
import dotenv from 'dotenv';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { TenantDatabaseService } from '../src/services/tenantDataService';

dotenv.config();

const KNOWN_DOC_IDS: Record<string, string[]> = {
  employees: ['EMP-DEMO-101', 'EMP-DEMO-102', 'EMP-DEMO-103', 'emp-qa-master'],
  contracts: ['CTR-DEMO-101', 'CTR-DEMO-102', 'CTR-DEMO-103'],
  leave_requests: ['LEAVE-DEMO-101', 'LEAVE-DEMO-102', 'LV-QA-TEST-001'],
  leave_allocations: [],
  onboarding_plans: ['ONB-QA-001'],
};

const RELATED_COLLECTIONS = [
  'contracts',
  'commencements',
  'leave_requests',
  'leave_allocations',
  'attendance',
  'payslips',
  'loans',
  'employee_documents',
  'work_on_holidays',
  'onboarding_plans',
  'documents',
  'leave_settlements',
];

function parseArgs() {
  return { dryRun: process.argv.includes('--dry-run') };
}

function isDemoOrQaEntity(id: string, data: Record<string, unknown>): boolean {
  const idLower = id.toLowerCase();
  if (
    idLower.includes('demo') ||
    idLower.includes('-qa-') ||
    idLower.startsWith('emp-qa') ||
    idLower.startsWith('lv-qa') ||
    idLower.startsWith('onb-qa')
  ) {
    return true;
  }

  const email = String(data.email || data.workEmail || '').toLowerCase();
  if (email.includes('.demo@') || email.includes('qa.master@')) return true;

  const name = String(data.fullNameAr || data.nameAr || data.name || data.employeeName || '');
  if (name.includes('[QA]') || name.includes('تجريبي') || name.includes('DEMO')) return true;

  const reason = String(data.reason || data.notes || '');
  if (reason.includes('[QA]') || reason.includes('DemoSeed')) return true;

  const tags = data.tags;
  if (Array.isArray(tags) && tags.some(t => /qa|تجريبي|demo/i.test(String(t)))) return true;

  return false;
}

async function collectDemoEmployeeIds(): Promise<Set<string>> {
  const ids = new Set<string>(KNOWN_DOC_IDS.employees);
  const snap = await getDocs(collection(db, 'employees'));
  snap.forEach((d) => {
    if (isDemoOrQaEntity(d.id, d.data() as Record<string, unknown>)) {
      ids.add(d.id);
    }
  });
  return ids;
}

async function deleteDocIfExists(col: string, id: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`[dry-run] delete ${col}/${id}`);
    return;
  }
  try {
    await deleteDoc(doc(db, col, id));
    console.log(`deleted ${col}/${id}`);
  } catch (e) {
    console.warn(`skip ${col}/${id}`, e);
  }
}

async function purgeByEmployeeId(employeeId: string, dryRun: boolean) {
  if (dryRun) {
    console.log(`[dry-run] cascade employee ${employeeId}`);
    return;
  }
  const ok = await TenantDatabaseService.deleteEmployee(employeeId);
  console.log(ok ? `cascade deleted employee ${employeeId}` : `failed employee ${employeeId}`);
}

async function purgeOrphanDemoDocs(dryRun: boolean) {
  for (const [col, ids] of Object.entries(KNOWN_DOC_IDS)) {
    for (const id of ids) {
      await deleteDocIfExists(col, id, dryRun);
    }
  }

  for (const col of RELATED_COLLECTIONS) {
    const snap = await getDocs(collection(db, col));
    for (const d of snap.docs) {
      const data = d.data() as Record<string, unknown>;
      if (!isDemoOrQaEntity(d.id, data)) continue;
      await deleteDocIfExists(col, d.id, dryRun);
    }
  }
}

async function main() {
  const { dryRun } = parseArgs();
  console.log(`=== Purge demo / QA data ${dryRun ? '(DRY RUN)' : ''} ===\n`);

  const employeeIds = await collectDemoEmployeeIds();
  console.log(`Found ${employeeIds.size} demo/QA employee id(s)\n`);

  for (const employeeId of employeeIds) {
    await purgeByEmployeeId(employeeId, dryRun);
  }

  await purgeOrphanDemoDocs(dryRun);

  console.log('\nDone. Clear browser localStorage demo mirrors (manara_*, odoo_*) if stale UI remains.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
