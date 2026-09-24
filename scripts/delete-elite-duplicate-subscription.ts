/**
 * Removes legacy duplicate Elite subscription (sub-1788435917695).
 * Keeps sub-comp-1788435917695 (admin@eliteclinic.com).
 * Usage: npx tsx scripts/delete-elite-duplicate-subscription.ts
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const LEGACY_SUB_ID = 'sub-1788435917695';
const CANONICAL_SUB_ID = 'sub-comp-1788435917695';

async function main() {
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');
  }

  const [legacy, canonical] = await Promise.all([
    db.collection('subscriptions').doc(LEGACY_SUB_ID).get(),
    db.collection('subscriptions').doc(CANONICAL_SUB_ID).get(),
  ]);

  if (!canonical.exists) {
    throw new Error(`Canonical subscription missing: ${CANONICAL_SUB_ID}`);
  }

  const canonicalEmail = String(canonical.data()?.email || '').toLowerCase();
  if (canonicalEmail !== 'admin@eliteclinic.com') {
    throw new Error(`Canonical subscription email unexpected: ${canonicalEmail}`);
  }

  if (!legacy.exists) {
    console.log('Legacy subscription already absent:', LEGACY_SUB_ID);
    return;
  }

  await db.collection('subscriptions').doc(LEGACY_SUB_ID).delete();
  console.log('Deleted legacy subscription:', LEGACY_SUB_ID);
  console.log('Kept:', CANONICAL_SUB_ID, canonical.data());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
