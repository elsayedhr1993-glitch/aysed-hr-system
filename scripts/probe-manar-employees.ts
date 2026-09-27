import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const hints = [
  'فؤاد',
  'كريم بخش',
  'نادية',
  'المنار',
  'comp-1788442584841',
];

async function main() {
  const db = getAdminFirestore();
  const all = await db.collection('employees').get();
  const manar = all.docs.filter((d) => d.data().companyId === 'comp-1788442584841');
  const byName = all.docs.filter((d) => {
    const n = String(d.data().fullNameAr || d.data().nameAr || '');
    return hints.some((h) => n.includes(h));
  });
  console.log(
    JSON.stringify(
      {
        totalEmployees: all.size,
        manarByCompanyId: manar.length,
        manarRows: manar.map((d) => ({
          id: d.id,
          name: d.data().fullNameAr,
          civilId: d.data().civilId,
          companyId: d.data().companyId,
        })),
        hintMatches: byName.map((d) => ({
          id: d.id,
          name: d.data().fullNameAr,
          civilId: d.data().civilId,
          companyId: d.data().companyId,
        })),
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
