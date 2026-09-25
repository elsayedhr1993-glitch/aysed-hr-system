import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('no admin');
  const snap = await db.collection('companies').get();
  for (const d of snap.docs) {
    const n = String(d.data().nameAr || d.data().name || '');
    if (n.includes('فنار') || n.includes('منار') || d.id.includes('fanar') || d.id.includes('178841')) {
      console.log(d.id, '|', n, '|', d.data().email || '');
    }
  }
}

main();
