/**
 * Probe Al-Fanar tenant in Firestore (company doc + employees by companyId).
 * Requires FIREBASE_SERVICE_ACCOUNT in .env (same as other admin scripts).
 *
 * Usage: npx tsx scripts/probe-fanar-company-admin.ts
 */
import 'dotenv/config';
import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const PRIMARY_COMPANY_ID = 'tenant_1788413304890';
const ALT_COMPANY_IDS = ['comp-alfanar', 'tenant_1788413304890'];
const TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
    }),
  ]);
}

function assertAdminReady(): Firestore {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || '';
  if (!raw || raw.includes('YOUR_')) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing or still a placeholder in .env');
  }
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin did not initialize (invalid service account or private key)');
  }
  return db;
}

async function main() {
  const db = assertAdminReady();
  const companyIds = [...new Set([PRIMARY_COMPANY_ID, ...ALT_COMPANY_IDS])];

  const companies: Record<string, unknown> = {};
  for (const id of companyIds) {
    const snap = await withTimeout(db.collection('companies').doc(id).get(), TIMEOUT_MS, `companies/${id}`);
    const data = snap.exists ? snap.data() : undefined;
    companies[id] = snap.exists
      ? {
          exists: true,
          nameAr: data?.nameAr ?? data?.name,
          nameEn: data?.nameEn,
          commercialRegNo: data?.commercialRegNo ?? data?.commercialReg ?? data?.crNumber,
          civilIdCompany: data?.civilIdCompany ?? data?.civilId,
        }
      : { exists: false };
  }

  const employeeCounts: Record<string, number> = {};
  let primaryRows: Array<{ id: string; name: string; civilId: string; jobTitle: string }> = [];

  for (const id of companyIds) {
    const snap = await withTimeout(
      db.collection('employees').where('companyId', '==', id).get(),
      TIMEOUT_MS,
      `employees where companyId==${id}`
    );
    employeeCounts[id] = snap.size;
    if (id === PRIMARY_COMPANY_ID) {
      primaryRows = snap.docs
        .map((d) => {
          const e = d.data();
          return {
            id: d.id,
            name: String(e.fullNameAr || e.nameAr || e.name || '').trim(),
            civilId: String(e.civilId || '').trim(),
            jobTitle: String(e.jobTitle || '').trim(),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        primaryCompanyId: PRIMARY_COMPANY_ID,
        companies,
        employeeCounts,
        employees: {
          count: employeeCounts[PRIMARY_COMPANY_ID] ?? 0,
          rows: primaryRows,
        },
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
});
