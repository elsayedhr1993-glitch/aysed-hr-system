import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';

async function main() {
  const db = getAdminFirestore();
  const snap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  const rows = snap.docs.map((d) => {
    const e = d.data();
    return {
      id: d.id,
      name: e.fullNameAr || e.nameAr,
      civilId: e.civilId,
      job: e.jobTitle,
      salary: e.basicSalary,
    };
  });
  rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
