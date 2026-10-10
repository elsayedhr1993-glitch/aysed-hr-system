/**
 * Consolidated Firestore audit (Manar / Elite / Fadia / Fanar).
 * Uses client SDK + per-query timeouts (Admin SDK often hangs in this environment).
 *
 * Usage:
 *   npx tsx scripts/audit-tenant-firestore.ts
 *   npx tsx scripts/audit-tenant-firestore.ts --apply-fadia-contract-ref
 */
import dotenv from 'dotenv';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import {
  contractQueryCompanyIds,
  employeeBelongsToTenant,
} from '../src/utils/contractTenantRules';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const MANAR = 'comp-1788442584841';
const ELITE = 'comp-1788435917695';
const FANAR = 'tenant_1788413304890';

const FADIA_CIVIL_IDS = ['274110503387', '297070500516', '297070500916'];
const FADIA_EMP_ID = 'EMP-2026-6728';
const FADIA_CONTRACT_ID = `contract-${ELITE}-${FADIA_EMP_ID}`;
const ELITE_STRAY_CONTRACT_ID = `contract-${ELITE}-EMP-2026-024`;

const APPLY_FADIA_FIX = process.argv.includes('--apply-fadia-contract-ref');

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function pickEmployeeSummary(id: string, data: Record<string, unknown>) {
  return {
    id,
    companyId: data.companyId,
    fullNameAr: data.fullNameAr ?? data.nameAr,
    civilId: data.civilId,
    status: data.status,
    isDeleted: data.isDeleted,
    contractRef: data.contractRef,
  };
}

function statusBreakdown(rows: { status?: unknown; isDeleted?: unknown }[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const deleted =
      r.isDeleted === true || String(r.status || '').toUpperCase() === 'DELETED';
    const key = deleted ? 'DELETED/FLAGGED' : String(r.status || '(empty)');
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

async function queryEmployeesByCompany(companyId: string) {
  const snap = await withTimeout(
    getDocs(query(collection(db, 'employees'), where('companyId', '==', companyId))),
    90_000,
    `employees companyId=${companyId}`,
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

async function queryContractsByCompany(companyId: string) {
  const snap = await withTimeout(
    getDocs(query(collection(db, 'contracts'), where('companyId', '==', companyId))),
    90_000,
    `contracts companyId=${companyId}`,
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
}

async function getDocData(coll: string, id: string) {
  const snap = await withTimeout(getDoc(doc(db, coll, id)), 60_000, `${coll}/${id}`);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function queryEmployeesByCivilId(civilId: string) {
  const snap = await withTimeout(
    getDocs(query(collection(db, 'employees'), where('civilId', '==', civilId))),
    60_000,
    `employees civilId=${civilId}`,
  );
  return snap.docs.map((d) => pickEmployeeSummary(d.id, d.data() as Record<string, unknown>));
}

async function main() {
  const report: Record<string, unknown> = { generatedAt: new Date().toISOString() };

  // --- Manar employees (field + tenant rule) ---
  const manarByField = await queryEmployeesByCompany(MANAR);
  const queryIds = new Set(contractQueryCompanyIds(MANAR));
  const manarByTenant = manarByField.filter((e) =>
    employeeBelongsToTenant(e as Record<string, unknown>, MANAR),
  );
  const manarDeleted = manarByField.filter(
    (e) => e.isDeleted === true || String(e.status || '').toUpperCase() === 'DELETED',
  );

  report.manar = {
    companyId: MANAR,
    employeesByCompanyIdField: manarByField.length,
    employeesPassingTenantRule: manarByTenant.length,
    statusBreakdown: statusBreakdown(manarByField as { status?: unknown; isDeleted?: unknown }[]),
    deletedCount: manarDeleted.length,
    deletedSample: manarDeleted.slice(0, 8).map((e) =>
      pickEmployeeSummary(String(e.id), e as Record<string, unknown>),
    ),
    queryCompanyIds: [...queryIds],
  };

  // --- Manar employees vs contracts ---
  const manarContracts = await queryContractsByCompany(MANAR);
  const empIds = new Set(manarByField.map((e) => String(e.id)));
  const contractEmpIds = new Set(
    manarContracts.map((c) => String(c.employeeId || '').trim()).filter(Boolean),
  );
  const contractMissingEmployee = [...contractEmpIds].filter((id) => !empIds.has(id));
  const employeeMissingContract = [...empIds].filter((id) => !contractEmpIds.has(id));

  report.manarContracts = {
    contracts: manarContracts.length,
    contractEmployeeIdsMissingEmployeeDoc: contractMissingEmployee,
    employeesWithoutContractRow: employeeMissingContract.length,
    sampleEmployeesWithoutContract: employeeMissingContract.slice(0, 10),
  };

  // --- Elite stray contract EMP-024 ---
  const eliteStray = await getDocData('contracts', ELITE_STRAY_CONTRACT_ID);
  report.eliteStrayContract = eliteStray
    ? {
        id: eliteStray.id,
        companyId: eliteStray.companyId,
        employeeId: eliteStray.employeeId,
        status: eliteStray.status,
      }
    : { id: ELITE_STRAY_CONTRACT_ID, exists: false };

  // --- Fadia / Aya civil IDs ---
  const civilHits: Record<string, unknown> = {};
  for (const civil of FADIA_CIVIL_IDS) {
    civilHits[civil] = await queryEmployeesByCivilId(civil);
  }
  report.civilIdLookup = civilHits;

  // --- Fadia employee doc + contractRef ---
  const fadiaEmp = await getDocData('employees', FADIA_EMP_ID);
  const fadiaContract = await getDocData('contracts', FADIA_CONTRACT_ID);
  const expectedRef = FADIA_CONTRACT_ID;
  const currentRef = fadiaEmp ? String(fadiaEmp.contractRef || '') : '';
  report.fadia = {
    employee: fadiaEmp ? pickEmployeeSummary(String(fadiaEmp.id), fadiaEmp as Record<string, unknown>) : null,
    contract: fadiaContract
      ? {
          id: fadiaContract.id,
          companyId: fadiaContract.companyId,
          employeeId: fadiaContract.employeeId,
          status: fadiaContract.status,
        }
      : null,
    contractRefExpected: expectedRef,
    contractRefMatches: currentRef === expectedRef,
    contractRefFixApplied: false,
  };

  if (APPLY_FADIA_FIX && fadiaEmp && currentRef !== expectedRef) {
    await withTimeout(
      updateDoc(doc(db, 'employees', FADIA_EMP_ID), { contractRef: expectedRef }),
      60_000,
      'patch Fadia contractRef',
    );
    (report.fadia as Record<string, unknown>).contractRefFixApplied = true;
    (report.fadia as Record<string, unknown>).contractRefMatches = true;
  }

  // --- Fanar EMP-030 ---
  const emp030 = await getDocData('employees', 'EMP-2026-030');
  const fanarSnap = await withTimeout(
    getDocs(query(collection(db, 'employees'), where('companyId', '==', FANAR))),
    90_000,
    `employees companyId=${FANAR}`,
  );
  const fanarHits = fanarSnap.docs
    .filter((d) => {
      const e = d.data();
      const name = String(e.fullNameAr || e.nameAr || '');
      return d.id === 'EMP-2026-030' || name.includes('يوسف') || name.includes('اسماعيل');
    })
    .map((d) => pickEmployeeSummary(d.id, d.data() as Record<string, unknown>));

  report.fanarEmp030 = {
    globalDocEMP2026030: emp030
      ? pickEmployeeSummary('EMP-2026-030', emp030 as Record<string, unknown>)
      : null,
    fanarCompanyMatches: fanarHits,
  };

  // --- فاديا name search (Manar + Elite field only, not full scan) ---
  const fadiaNameHits: unknown[] = [];
  for (const companyId of [MANAR, ELITE]) {
    const emps = await queryEmployeesByCompany(companyId);
    for (const e of emps) {
      const name = String(e.fullNameAr || e.nameAr || '');
      if (/فاد|Fadia/i.test(name)) {
        fadiaNameHits.push(pickEmployeeSummary(String(e.id), e as Record<string, unknown>));
      }
    }
  }
  const eliteContracts = await queryContractsByCompany(ELITE);
  const fadiaContractHits = eliteContracts
    .filter((c) => /فاد|Fadia|6728/i.test(JSON.stringify(c)))
    .map((c) => ({
      id: c.id,
      companyId: c.companyId,
      employeeId: c.employeeId,
      status: c.status,
    }));
  report.fadiaNameSearch = { employees: fadiaNameHits, eliteContracts: fadiaContractHits };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('[audit-tenant-firestore] FAILED:', err?.message || err);
  process.exit(1);
});
