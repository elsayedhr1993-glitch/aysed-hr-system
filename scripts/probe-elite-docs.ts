/**
 * Read Elite tenant user, company, subscriptions (no writes).
 * Usage: npx tsx scripts/probe-elite-docs.ts
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const ELITE_UID = 'cRaM4F3r7DWmE0PeUIl1sgN1ffC3';
const ELITE_COMPANY_ID = 'comp-1788435917695';

async function main() {
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');
  }

  const [u, c, subsSnap] = await Promise.all([
    db.collection('users').doc(ELITE_UID).get(),
    db.collection('companies').doc(ELITE_COMPANY_ID).get(),
    db.collection('subscriptions').where('companyId', '==', ELITE_COMPANY_ID).get(),
  ]);

  const payload = {
    user: u.exists ? { id: u.id, ...u.data() } : null,
    company: c.exists ? { id: c.id, ...c.data() } : null,
    subs: subsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
