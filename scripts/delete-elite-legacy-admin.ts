/**
 * Remove legacy Elite admin (admin@eliteclinic.com) from Auth + Firestore users.
 * Usage: npx tsx scripts/delete-elite-legacy-admin.ts [--dry-run]
 */
import 'dotenv/config';
import { getAdminAuth, getAdminFirestore } from '../server/firebaseAdmin.ts';

const LEGACY_EMAIL = 'admin@eliteclinic.com';
const CANONICAL_EMAIL = 'admin@elite.com';
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const auth = getAdminAuth();
  const db = getAdminFirestore();
  if (!auth || !db) throw new Error('Firebase Admin unavailable');

  let legacyUid: string | null = null;
  try {
    legacyUid = (await auth.getUserByEmail(LEGACY_EMAIL)).uid;
  } catch (e: any) {
    if (e?.code === 'auth/user-not-found') {
      console.log(JSON.stringify({ ok: true, legacy: 'already absent', canonical: CANONICAL_EMAIL }, null, 2));
      return;
    }
    throw e;
  }

  const canonical = await auth.getUserByEmail(CANONICAL_EMAIL);
  const company = (await db.collection('companies').doc('comp-1788435917695').get()).data();

  if (!dryRun) {
    await auth.deleteUser(legacyUid);
    await db.collection('users').doc(legacyUid).delete().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        deletedLegacy: { email: LEGACY_EMAIL, uid: legacyUid },
        keptCanonical: { email: CANONICAL_EMAIL, uid: canonical.uid },
        companyAdminUsername: company?.adminUsername,
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
