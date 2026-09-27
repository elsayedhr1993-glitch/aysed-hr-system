/**
 * Remove legacy commercial registry fields for MOH medical tenants (Firestore Admin).
 *
 * Usage:
 *   npx tsx scripts/clear-moh-company-cr-admin.ts
 *   npx tsx scripts/clear-moh-company-cr-admin.ts tenant_1788413304890
 */
import 'dotenv/config';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const DEFAULT_COMPANY_ID = 'tenant_1788413304890'; // الفنار كلينك

const CR_FIELD_DELETES = {
  commercialRegNo: FieldValue.delete(),
  commercialReg: FieldValue.delete(),
  crNumber: FieldValue.delete(),
  commercialLicenseNo: FieldValue.delete(),
  regulatoryRegime: 'MOH_MEDICAL',
  mohCrFieldsClearedAt: new Date().toISOString(),
};

function commercialDocId(companyId: string): string {
  return `lic-${companyId}-commercial`;
}

async function main() {
  const companyId = (process.argv[2] || DEFAULT_COMPANY_ID).trim();
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable — check FIREBASE_SERVICE_ACCOUNT');

  const companyRef = db.collection('companies').doc(companyId);
  const before = await companyRef.get();
  if (!before.exists) {
    throw new Error(`Company document not found: companies/${companyId}`);
  }

  const beforeData = before.data() || {};
  await companyRef.set(CR_FIELD_DELETES, { merge: true });

  const facilityId = `facility_licensing_${companyId}`;
  const facilityRef = db.collection('system_config').doc(facilityId);
  const facilitySnap = await facilityRef.get();
  if (facilitySnap.exists) {
    await facilityRef.set(
      {
        commercialRegNo: FieldValue.delete(),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  const commercialLicRef = db.collection('company_documents').doc(commercialDocId(companyId));
  const commercialLicSnap = await commercialLicRef.get();
  let commercialDocDeleted = false;
  if (commercialLicSnap.exists) {
    await commercialLicRef.delete();
    commercialDocDeleted = true;
  }

  const after = await companyRef.get();
  const afterData = after.data() || {};

  console.log(
    JSON.stringify(
      {
        ok: true,
        companyId,
        before: {
          commercialRegNo: beforeData.commercialRegNo ?? null,
          commercialReg: beforeData.commercialReg ?? null,
          crNumber: beforeData.crNumber ?? null,
          commercialLicenseNo: beforeData.commercialLicenseNo ?? null,
          regulatoryRegime: beforeData.regulatoryRegime ?? null,
          mohLicense: beforeData.mohLicense ?? null,
        },
        after: {
          commercialRegNo: afterData.commercialRegNo ?? null,
          commercialReg: afterData.commercialReg ?? null,
          crNumber: afterData.crNumber ?? null,
          commercialLicenseNo: afterData.commercialLicenseNo ?? null,
          regulatoryRegime: afterData.regulatoryRegime ?? null,
          mohLicense: afterData.mohLicense ?? null,
        },
        facilityMasterPatched: facilitySnap.exists,
        commercialLicenseDocDeleted: commercialDocDeleted,
        commercialLicenseDocId: commercialDocId(companyId),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
});
