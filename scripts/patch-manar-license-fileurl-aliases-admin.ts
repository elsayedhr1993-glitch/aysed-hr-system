import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';

const ALIASES = [
  { targetId: `lic-${COMPANY_ID}-baladiya`, sourceId: `lic-${COMPANY_ID}-traffic` },
  { targetId: `lic-${COMPANY_ID}-pam`, sourceId: `lic-${COMPANY_ID}-signature-auth` },
];

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  for (const { targetId, sourceId } of ALIASES) {
    const source = await db.collection('company_documents').doc(sourceId).get();
    const fileUrl = String(source.data()?.fileUrl || '').trim();
    if (!fileUrl) {
      console.warn(JSON.stringify({ skip: targetId, reason: 'no_source_url', sourceId }));
      continue;
    }
    await db.collection('company_documents').doc(targetId).set({ fileUrl }, { merge: true });
    console.log(JSON.stringify({ ok: true, targetId, sourceId }));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
