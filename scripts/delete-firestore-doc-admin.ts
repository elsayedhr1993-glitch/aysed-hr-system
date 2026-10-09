import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const path = process.argv[2];
if (!path) {
  console.error('Usage: npx tsx scripts/delete-firestore-doc-admin.ts <collection/docId>');
  process.exit(1);
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');
  const ref = db.doc(path);
  const snap = await ref.get();
  if (!snap.exists) {
    console.log(JSON.stringify({ deleted: false, reason: 'not_found', path }, null, 2));
    return;
  }
  await ref.delete();
  console.log(JSON.stringify({ deleted: true, path, preview: snap.data() }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
