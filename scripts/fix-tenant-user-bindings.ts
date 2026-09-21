import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Admin Firestore unavailable');

  const fixes: Array<{ uid: string; patch: Record<string, unknown> }> = [
    {
      uid: 'cBGREbOjS0cNRupuSoIV5dZglgG2',
      patch: { email: 'admin@almanar.com', role: 'COMPANY_ADMIN', companyId: 'comp-1788442584841' },
    },
  ];

  await db.collection('companies').doc('comp-1788435917695').set(
    { adminUsername: 'admin@eliteclinic.com', email: 'admin@eliteclinic.com' },
    { merge: true }
  );

  await db.collection('companies').doc('comp-1788442584841').set(
    { adminUsername: 'admin@almanar.com', email: 'admin@almanar.com' },
    { merge: true }
  );

  for (const fix of fixes) {
    console.log('PATCH user', fix.uid, fix.patch);
    await db.collection('users').doc(fix.uid).set(fix.patch, { merge: true });
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
