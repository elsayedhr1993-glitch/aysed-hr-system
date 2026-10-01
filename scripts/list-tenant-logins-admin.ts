import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT');

  const companiesSnap = await db.collection('companies').get();
  const companies = companiesSnap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      nameAr: v.nameAr || v.name,
      adminUsername: v.adminUsername,
      email: v.email,
      adminEmail: v.adminEmail,
      ownerEmail: v.ownerEmail,
      contactEmail: v.contactEmail,
    };
  });

  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs.map((d) => {
    const v = d.data();
    return {
      uid: d.id,
      email: v.email,
      role: v.role,
      companyId: v.companyId,
      status: v.status,
    };
  });

  const manarId = 'comp-1788442584841';
  console.log(
    JSON.stringify(
      {
        superAdminEmailsFromCode: ['admin@aysed.com', 'elsayedhr1993@gmail.com'],
        manarCompany: companies.find((c) => c.id === manarId),
        manarLinkedUsers: users.filter((u) => u.companyId === manarId),
        allCompanies: companies.sort((a, b) => String(a.nameAr).localeCompare(String(b.nameAr), 'ar')),
        allUsers: users.sort((a, b) => String(a.email).localeCompare(String(b.email))),
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
