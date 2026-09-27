import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');
  await db.collection('companies').doc(COMPANY_ID).set(
    {
      regulatoryRegime: 'MOH_MEDICAL',
      nameAr: 'المنار كلينك',
      nameEn: 'Al Manar Clinic',
      licensesPipelineReadyAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log(JSON.stringify({ ok: true, companyId: COMPANY_ID, regulatoryRegime: 'MOH_MEDICAL' }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
