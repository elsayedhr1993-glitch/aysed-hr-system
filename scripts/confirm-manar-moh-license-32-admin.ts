import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';
const DOC_ID = 'lic-comp-1788442584841-moh';
const NOTES =
  'مصدر: ترخيص مستوصف المنار - 04-05-2029.pdf | رقم الترخيص: 32 (مؤكد) | تخصصات: جلدية وتناسلية، ممارس عام، أسنان | عدد العيادات: 32';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  await db.collection('company_documents').doc(DOC_ID).set(
    {
      documentNumber: '32',
      notes: NOTES,
      issueDate: '2024-04-25',
      expiryDate: '2029-04-25',
    },
    { merge: true }
  );
  await db.collection('companies').doc(COMPANY_ID).set({ mohLicense: '32' }, { merge: true });
  await db
    .collection('system_config')
    .doc(`facility_licensing_${COMPANY_ID}`)
    .set({ mohLicenseNo: '32' }, { merge: true });

  console.log(JSON.stringify({ ok: true, mohLicenseNo: '32', documentId: DOC_ID }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
