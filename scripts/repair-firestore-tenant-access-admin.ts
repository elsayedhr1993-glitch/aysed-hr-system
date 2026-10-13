/**
 * Repairs Manar (and other tenant) Firestore access prerequisites:
 * - company admin emails on company docs
 * - users/{uid}.companyId + custom claims
 * - employees missing companyId / company_id for Manar
 *
 * Run: npx tsx scripts/repair-firestore-tenant-access-admin.ts
 */
import 'dotenv/config';
import { getAdminAuth, getAdminFirestore } from '../server/firebaseAdmin.ts';

const MANAR_COMPANY_ID = 'comp-1788442584841';
const MANAR_COMPANY_ID_TYPO = 'comp-1788142584811';
const MANAR_ADMIN_EMAIL = 'admin@almanar.com';

const COMPANY_ADMIN_PATCHES: Record<string, { adminUsername: string; email: string }> = {
  [MANAR_COMPANY_ID]: { adminUsername: MANAR_ADMIN_EMAIL, email: MANAR_ADMIN_EMAIL },
  'comp-1788435917695': { adminUsername: 'admin@eliteclinic.com', email: 'admin@eliteclinic.com' },
};

async function main() {
  const db = getAdminFirestore();
  const auth = getAdminAuth();
  if (!db || !auth) throw new Error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT)');

  for (const [companyId, patch] of Object.entries(COMPANY_ADMIN_PATCHES)) {
    console.log('Patch company', companyId, patch);
    await db.collection('companies').doc(companyId).set(
      { ...patch, isActive: true, status: 'active' },
      { merge: true }
    );
  }

  const usersSnap = await db.collection('users').get();
  let usersPatched = 0;
  let claimsPatched = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const email = String(data.email || data.adminUsername || '').trim().toLowerCase();
    if (!email) continue;

    let targetCompanyId = String(data.companyId || data.company_id || data.activeCompanyId || '').trim();
    if (!targetCompanyId) {
      for (const [companyId, patch] of Object.entries(COMPANY_ADMIN_PATCHES)) {
        if (email === patch.email.toLowerCase()) {
          targetCompanyId = companyId;
          break;
        }
      }
    }

    if (targetCompanyId === MANAR_COMPANY_ID_TYPO) {
      targetCompanyId = MANAR_COMPANY_ID;
    }
    if (!targetCompanyId) continue;

    const role = String(data.role || 'COMPANY_ADMIN').toUpperCase();
    await userDoc.ref.set(
      {
        email,
        companyId: targetCompanyId,
        company_id: targetCompanyId,
        activeCompanyId: targetCompanyId,
        role: role === 'SUPER_ADMIN' ? role : 'COMPANY_ADMIN',
      },
      { merge: true }
    );
    usersPatched += 1;

    try {
      const userRecord = await auth.getUser(userDoc.id);
      const claims = userRecord.customClaims || {};
      if (claims.companyId !== targetCompanyId || claims.role !== 'COMPANY_ADMIN') {
        await auth.setCustomUserClaims(userDoc.id, {
          ...claims,
          companyId: targetCompanyId,
          role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'COMPANY_ADMIN',
        });
        claimsPatched += 1;
      }
    } catch (e) {
      console.warn('Claims skip', userDoc.id, e);
    }
  }

  let employeesPatched = 0;
  const employeeIds = new Set<string>();

  const byCompanyId = await db
    .collection('employees')
    .where('companyId', '==', MANAR_COMPANY_ID)
    .get();
  const byLegacyId = await db
    .collection('employees')
    .where('company_id', '==', MANAR_COMPANY_ID)
    .get();

  for (const snap of [byCompanyId, byLegacyId]) {
    for (const empDoc of snap.docs) {
      employeeIds.add(empDoc.id);
      const data = empDoc.data();
      if (String(data.companyId || '') !== MANAR_COMPANY_ID || String(data.company_id || '') !== MANAR_COMPANY_ID) {
        await empDoc.ref.set(
          { companyId: MANAR_COMPANY_ID, company_id: MANAR_COMPANY_ID },
          { merge: true }
        );
        employeesPatched += 1;
      }
    }
  }

  const emptyCompanySnap = await db.collection('employees').where('companyId', '==', '').get();
  for (const empDoc of emptyCompanySnap.docs) {
    if (employeeIds.has(empDoc.id)) continue;
    const data = empDoc.data();
    if (String(data.company_id || '') !== MANAR_COMPANY_ID) continue;
    await empDoc.ref.set(
      { companyId: MANAR_COMPANY_ID, company_id: MANAR_COMPANY_ID },
      { merge: true }
    );
    employeesPatched += 1;
  }

  let typoUsers = 0;
  let typoEmployees = 0;
  const typoUsersSnap = await db.collection('users').where('companyId', '==', MANAR_COMPANY_ID_TYPO).get();
  for (const userDoc of typoUsersSnap.docs) {
    await userDoc.ref.set(
      {
        companyId: MANAR_COMPANY_ID,
        company_id: MANAR_COMPANY_ID,
        activeCompanyId: MANAR_COMPANY_ID,
      },
      { merge: true }
    );
    typoUsers += 1;
  }
  const typoEmpSnap = await db.collection('employees').where('companyId', '==', MANAR_COMPANY_ID_TYPO).get();
  for (const empDoc of typoEmpSnap.docs) {
    await empDoc.ref.set(
      { companyId: MANAR_COMPANY_ID, company_id: MANAR_COMPANY_ID },
      { merge: true }
    );
    typoEmployees += 1;
  }
  const typoCompany = await db.collection('companies').doc(MANAR_COMPANY_ID_TYPO).get();
  if (typoCompany.exists) {
    await db.collection('companies').doc(MANAR_COMPANY_ID_TYPO).delete().catch(() => {});
    console.log('Removed duplicate typo company doc', MANAR_COMPANY_ID_TYPO);
  }

  console.log(
    JSON.stringify(
      {
        usersPatched,
        claimsPatched,
        employeesPatched,
        typoUsersRemapped: typoUsers,
        typoEmployeesRemapped: typoEmployees,
        manarCompanyId: MANAR_COMPANY_ID,
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
