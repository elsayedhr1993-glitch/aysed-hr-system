/**
 * Remove duplicate Firestore `contracts` docs (keep one canonical doc per employee per company).
 *
 * Usage:
 *   npx tsx scripts/dedupe-duplicate-contracts-admin.ts --dry-run
 *   npx tsx scripts/dedupe-duplicate-contracts-admin.ts --company comp-1788435917695
 *   npx tsx scripts/dedupe-duplicate-contracts-admin.ts --all-companies
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { normalizeContractStatus } from '../src/utils/contractStatus.ts';

type ContractRow = {
  docId: string;
  companyId: string;
  employeeKey: string;
  employeeId?: string;
  employeeName?: string;
  status: string;
  updatedAt?: string;
};

const dryRun = process.argv.includes('--dry-run');
const allCompanies = process.argv.includes('--all-companies');
const purgeOrphans = process.argv.includes('--purge-orphans') || !process.argv.includes('--no-purge-orphans');
const companyArgIdx = process.argv.indexOf('--company');
const companyFilter =
  companyArgIdx >= 0 ? String(process.argv[companyArgIdx + 1] || '').trim() : '';

function statusRank(status: unknown): number {
  const s = normalizeContractStatus(String(status || ''));
  if (s === 'running') return 3;
  if (s === 'draft') return 2;
  return 1;
}

function resolveEmployeeKey(
  docId: string,
  companyId: string,
  data: Record<string, unknown>
): string {
  const explicit = String(data.employeeId || '').trim();
  if (explicit) return explicit;
  const prefix = `contract-${companyId}-`;
  if (docId.startsWith(prefix)) {
    return docId.slice(prefix.length);
  }
  return '';
}

function pickKeeper(rows: ContractRow[]): ContractRow {
  return rows.reduce((a, b) => {
    const ra = statusRank(a.status);
    const rb = statusRank(b.status);
    if (rb !== ra) return rb > ra ? b : a;
    const canonicalA = a.docId.startsWith(`contract-${a.companyId}-`) ? 1 : 0;
    const canonicalB = b.docId.startsWith(`contract-${b.companyId}-`) ? 1 : 0;
    if (canonicalB !== canonicalA) return canonicalB > canonicalA ? b : a;
    const ua = a.updatedAt || '';
    const ub = b.updatedAt || '';
    if (ub !== ua) return ub > ua ? b : a;
    return b.docId.localeCompare(a.docId) > 0 ? b : a;
  });
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable (FIREBASE_SERVICE_ACCOUNT)');

  const [snap, employeeSnap] = await Promise.all([
    db.collection('contracts').get(),
    db.collection('employees').get(),
  ]);

  const employeeById = new Map<string, { companyId: string }>();
  for (const doc of employeeSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    employeeById.set(doc.id, { companyId: String(data.companyId || '').trim() });
  }

  const rows: ContractRow[] = [];
  const orphanDeletes: ContractRow[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const companyId = String(data.companyId || '').trim();
    if (!companyId) continue;
    if (!allCompanies && companyFilter && companyId !== companyFilter) continue;

    const employeeKey = resolveEmployeeKey(doc.id, companyId, data);
    if (!employeeKey) {
      if (purgeOrphans) {
        orphanDeletes.push({
          docId: doc.id,
          companyId,
          employeeKey: '(unresolved)',
          employeeName: data.employeeName ? String(data.employeeName) : undefined,
          status: String(data.status || data.contractStatus || 'draft'),
          updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
        });
      }
      continue;
    }

    const emp = employeeById.get(employeeKey);
    if (!emp || emp.companyId !== companyId) {
      if (purgeOrphans) {
        orphanDeletes.push({
          docId: doc.id,
          companyId,
          employeeKey,
          employeeId: data.employeeId ? String(data.employeeId) : undefined,
          employeeName: data.employeeName ? String(data.employeeName) : undefined,
          status: String(data.status || data.contractStatus || 'draft'),
          updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
        });
      }
      continue;
    }

    rows.push({
      docId: doc.id,
      companyId,
      employeeKey,
      employeeId: data.employeeId ? String(data.employeeId) : undefined,
      employeeName: data.employeeName ? String(data.employeeName) : undefined,
      status: String(data.status || data.contractStatus || 'draft'),
      updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    });
  }

  const groups = new Map<string, ContractRow[]>();
  for (const row of rows) {
    const key = `${row.companyId}::${row.employeeKey}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  const toDelete: ContractRow[] = [...orphanDeletes];
  const keepers: ContractRow[] = [];

  for (const group of groups.values()) {
    if (group.length <= 1) {
      if (group[0]) keepers.push(group[0]);
      continue;
    }
    const keeper = pickKeeper(group);
    keepers.push(keeper);
    for (const row of group) {
      if (row.docId !== keeper.docId) toDelete.push(row);
    }
  }

  const summary = {
    dryRun,
    companyFilter: allCompanies ? 'ALL' : companyFilter || 'ALL (no --company filter)',
    totalContractDocsScanned: snap.size,
    employeesWithContracts: groups.size,
    orphanContractsRemoved: orphanDeletes.length,
    duplicateDocsToRemove: toDelete.length - orphanDeletes.length,
    totalDocsToDelete: toDelete.length,
    sampleDeletes: toDelete.slice(0, 15).map((r) => ({
      docId: r.docId,
      companyId: r.companyId,
      employeeKey: r.employeeKey,
      name: r.employeeName,
      status: r.status,
    })),
  };

  if (!dryRun && toDelete.length > 0) {
    const batchSize = 400;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const chunk = toDelete.slice(i, i + batchSize);
      for (const row of chunk) {
        batch.delete(db.collection('contracts').doc(row.docId));
      }
      await batch.commit();
    }

    for (const keeper of keepers) {
      const empId = keeper.employeeKey;
      const empRef = db.collection('employees').doc(empId);
      const empSnap = await empRef.get();
      if (!empSnap.exists) continue;
      const emp = empSnap.data() as Record<string, unknown>;
      if (String(emp.companyId || '') !== keeper.companyId) continue;
      await empRef.set(
        {
          contractRef: keeper.docId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
