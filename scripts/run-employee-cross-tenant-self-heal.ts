/**
 * Runs cross-tenant employee self-heal using the same Web SDK module as the app.
 * Loads .env for local runs; requires Firestore rules to allow deletes OR run while rules permit admin SDK bypass is NOT used here.
 *
 * Usage: npx tsx scripts/run-employee-cross-tenant-self-heal.ts [--dry-run] [civilId]
 */
import 'dotenv/config';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

async function ensureAuth() {
  const email = process.env.SELF_HEAL_FIREBASE_EMAIL || process.env.FIREBASE_HEAL_EMAIL;
  const password = process.env.SELF_HEAL_FIREBASE_PASSWORD || process.env.FIREBASE_HEAL_PASSWORD;
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  const auth = getAuth();
  if (auth.currentUser) return auth.currentUser;
  if (!email || !password) {
    console.warn(
      'No SELF_HEAL_FIREBASE_EMAIL/PASSWORD — attempting heal without sign-in (works if rules allow or emulator).'
    );
    return null;
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const civilArg = process.argv.find((a) => /^\d{8,}$/.test(a.replace(/\D/g, '')));
  const civilId = civilArg ? civilArg.replace(/\D/g, '') : undefined;

  await ensureAuth();

  const { healCrossTenantEmployeeDuplicates, ALMANAR_CANONICAL_COMPANY_ID } = await import(
    '../src/services/employeeCrossTenantSelfHeal.ts'
  );

  const result = await healCrossTenantEmployeeDuplicates({
    civilId,
    canonicalCompanyId: ALMANAR_CANONICAL_COMPANY_ID,
    dryRun,
  });

  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
