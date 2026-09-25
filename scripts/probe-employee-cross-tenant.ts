/**
 * Find employee docs by civil ID or name fragment across all companies.
 * Usage: npx tsx scripts/probe-employee-cross-tenant.ts [civilIdOrSearch]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const CIVIL = process.argv[2] || '281072702865';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const snap = await db.collection('employees').get();
  const hits = snap.docs.filter((d) => {
    const data = d.data();
    const civil = String(data.civilId || data.civil_id || '');
    const name = String(data.fullNameAr || data.nameAr || data.name || '');
    return civil.includes(CIVIL) || name.includes('عبد الوهاب') || name.includes('عبدالوهاب');
  });

  console.log(`Matches: ${hits.length}`);
  for (const doc of hits) {
    const data = doc.data();
    console.log(JSON.stringify({
      docId: doc.id,
      companyId: data.companyId,
      name: data.fullNameAr || data.nameAr || data.name,
      civilId: data.civilId,
      employeeCode: data.employeeCode || data.id,
      status: data.status,
    }, null, 2));
  }

  const companyIds = [...new Set(hits.map((d) => d.data().companyId))];
  for (const cid of companyIds) {
    if (!cid) continue;
    const c = await db.collection('companies').doc(String(cid)).get();
    console.log('--- company', cid, c.exists ? (c.data()?.nameAr || c.data()?.name) : 'MISSING');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
