import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'tenant_1788413304890';
const TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
    }),
  ]);
}

async function main() {
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin not initialized — set FIREBASE_SERVICE_ACCOUNT in .env');
  }
  const snap = await withTimeout(
    db.collection('employees').where('companyId', '==', COMPANY_ID).get(),
    TIMEOUT_MS,
    'employees query'
  );
  const rows = snap.docs.map((d) => {
    const e = d.data();
    return { id: d.id, name: e.fullNameAr || e.nameAr, civilId: e.civilId, job: e.jobTitle };
  });
  rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
