/**
 * Repairs إيليت كلينك tenant admin: Firebase Auth + users/{uid} + company + subscription.
 * Usage: npx tsx scripts/repair-elite-tenant-auth.ts
 */
import 'dotenv/config';
import { getAdminAuth, getAdminFirestore } from '../server/firebaseAdmin.ts';

const ELITE_COMPANY_ID = 'comp-1788435917695';
const ELITE_ADMIN_EMAIL = 'admin@eliteclinic.com';
const DEFAULT_PASSWORD = process.env.ELITE_ADMIN_RESET_PASSWORD || 'Aysed2026#Secure';

async function main() {
  const auth = getAdminAuth();
  const db = getAdminFirestore();
  if (!auth || !db) {
    throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');
  }

  const email = ELITE_ADMIN_EMAIL.toLowerCase();
  let uid: string;
  let authUser;

  try {
    authUser = await auth.getUserByEmail(email);
    uid = authUser.uid;
    console.log('Found Auth user:', uid, 'disabled=', authUser.disabled);
  } catch (e: any) {
    if (e?.code !== 'auth/user-not-found') throw e;
    const created = await auth.createUser({
      email,
      password: DEFAULT_PASSWORD,
      emailVerified: true,
      displayName: 'إيليت كلينك',
    });
    uid = created.uid;
    authUser = created;
    console.log('Created Auth user:', uid);
  }

  if (authUser.disabled) {
    await auth.updateUser(uid, { disabled: false });
    console.log('Re-enabled Auth user');
  }

  await auth.updateUser(uid, {
    password: DEFAULT_PASSWORD,
    emailVerified: true,
    displayName: 'إيليت كلينك',
  });
  console.log('Password reset / verified for', email);

  await auth.setCustomUserClaims(uid, {
    role: 'COMPANY_ADMIN',
    companyId: ELITE_COMPANY_ID,
  });

  await db.collection('users').doc(uid).set(
    {
      email,
      name: 'مسؤول إيليت كلينك',
      role: 'COMPANY_ADMIN',
      companyId: ELITE_COMPANY_ID,
      status: 'active',
      suspended: false,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log('Patched users/', uid);

  await db.collection('companies').doc(ELITE_COMPANY_ID).set(
    {
      nameAr: 'إيليت كلينك',
      adminUsername: email,
      email,
      isActive: true,
      status: 'active',
      state: 'active',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log('Activated company', ELITE_COMPANY_ID);

  await db.collection('subscriptions').doc(`sub-${ELITE_COMPANY_ID}`).set(
    {
      id: `sub-${ELITE_COMPANY_ID}`,
      companyId: ELITE_COMPANY_ID,
      companyName: 'إيليت كلينك',
      email,
      status: 'active',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log('Activated subscription sub-', ELITE_COMPANY_ID);

  console.log('\nDone. Login:', email, '| temp password:', DEFAULT_PASSWORD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
