import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const [co, fac, docsSnap] = await Promise.all([
    db.collection('companies').doc(COMPANY_ID).get(),
    db.collection('system_config').doc(`facility_licensing_${COMPANY_ID}`).get(),
    db.collection('company_documents').where('companyId', '==', COMPANY_ID).get(),
  ]);

  console.log(
    JSON.stringify(
      {
        company: co.exists ? co.data() : null,
        facility: fac.exists ? fac.data() : null,
        documents: docsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
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
