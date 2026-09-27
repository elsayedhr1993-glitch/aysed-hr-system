import 'dotenv/config';
import { getAdminAuth, getAdminFirestore } from '../server/firebaseAdmin.ts';

const ELITE_ID = 'comp-1788435917695';
const ELITE_UID = 'cRaM4F3r7DWmE0PeUIl1sgN1ffC3';
const EMAIL = (process.env.ELITE_ADMIN_EMAIL || 'admin@elite.com').toLowerCase();

async function main() {
  const auth = getAdminAuth();
  const db = getAdminFirestore();
  if (!auth || !db) throw new Error('Firebase Admin unavailable');

  const email = EMAIL.toLowerCase();

  let authByEmail: Record<string, unknown> | null = null;
  try {
    const u = await auth.getUserByEmail(email);
    authByEmail = {
      uid: u.uid,
      email: u.email,
      disabled: u.disabled,
      emailVerified: u.emailVerified,
      displayName: u.displayName,
    };
  } catch (e: any) {
    console.log('Auth by email:', e?.code || e?.message);
  }

  let authByUid: Record<string, unknown> | null = null;
  try {
    const u = await auth.getUser(ELITE_UID);
    authByUid = {
      uid: u.uid,
      email: u.email,
      disabled: u.disabled,
      emailVerified: u.emailVerified,
      displayName: u.displayName,
    };
  } catch (e: any) {
    console.log('Auth by UID:', e?.code || e?.message);
  }

  const uidForClaims = authByUid?.uid || authByEmail?.uid;
  const customClaims = uidForClaims
    ? (await auth.getUser(String(uidForClaims))).customClaims
    : null;

  const userDocByExpectedUid = (await db.collection('users').doc(ELITE_UID).get());
  const usersByEmail = await db.collection('users').where('email', '==', email).get();
  const usersByCompany = await db.collection('users').where('companyId', '==', ELITE_ID).get();

  const companySnap = await db.collection('companies').doc(ELITE_ID).get();
  const company = companySnap.data();
  const subDoc = await db.collection('subscriptions').doc(`sub-${ELITE_ID}`).get();
  const subsQuery = await db.collection('subscriptions').where('companyId', '==', ELITE_ID).get();

  const uidMatchesEmail =
    authByEmail && authByUid ? String(authByEmail.uid) === String(authByUid.uid) : null;
  const userDoc = userDocByExpectedUid.exists ? userDocByExpectedUid.data() : null;
  const companyIdOnUser = userDoc?.companyId ? String(userDoc.companyId) : null;
  const roleOnUser = userDoc?.role ? String(userDoc.role) : null;

  const loginReady =
    Boolean(authByUid && !authByUid.disabled) &&
    String(authByUid.email || '').toLowerCase() === email &&
    String(authByUid.uid) === ELITE_UID &&
    userDocByExpectedUid.exists &&
    companyIdOnUser === ELITE_ID &&
    (company?.isActive !== false && company?.status !== 'suspended') &&
    (subDoc.data()?.status === 'active' || subsQuery.docs.some((d) => d.data().status === 'active'));

  console.log(
    JSON.stringify(
      {
        expected: { email, uid: ELITE_UID, companyId: ELITE_ID },
        authByEmail,
        authByUid,
        uidMatchesEmail,
        customClaims,
        usersDocExpectedUid: userDocByExpectedUid.exists
          ? { id: userDocByExpectedUid.id, ...userDoc }
          : null,
        usersByEmail: usersByEmail.docs.map((d) => ({ id: d.id, ...d.data() })),
        usersLinkedToCompany: usersByCompany.docs.map((d) => ({
          id: d.id,
          email: d.data().email,
          role: d.data().role,
          status: d.data().status,
          suspended: d.data().suspended,
        })),
        company: companySnap.exists
          ? {
              id: ELITE_ID,
              nameAr: company?.nameAr,
              isActive: company?.isActive,
              status: company?.status,
              state: company?.state,
              adminUsername: company?.adminUsername,
              email: company?.email,
            }
          : null,
        subscription: {
          docSubEliteId: subDoc.exists ? { id: subDoc.id, ...subDoc.data() } : null,
          allForCompany: subsQuery.docs.map((d) => ({ id: d.id, status: d.data().status, ...d.data() })),
        },
        permissionsSummary: {
          roleFromClaims: customClaims?.role ?? null,
          companyIdFromClaims: customClaims?.companyId ?? null,
          roleFromUsersDoc: roleOnUser,
          companyIdFromUsersDoc: companyIdOnUser,
          effectiveForApiAuth: customClaims?.role
            ? { role: customClaims.role, companyId: customClaims.companyId }
            : roleOnUser
              ? { role: roleOnUser, companyId: companyIdOnUser }
              : null,
        },
        accountStatus: {
          authDisabled: authByUid?.disabled ?? null,
          userSuspended: userDoc?.suspended ?? null,
          userStatus: userDoc?.status ?? null,
          emailVerified: authByUid?.emailVerified ?? null,
        },
        loginReady,
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
