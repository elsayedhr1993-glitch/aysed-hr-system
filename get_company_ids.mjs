import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function check() {
  const q = collection(db, 'employees');
  const snap = await getDocs(q);
  const companyIds = {};
  snap.forEach(doc => {
    const data = doc.data();
    companyIds[data.companyId || 'MISSING'] = (companyIds[data.companyId || 'MISSING'] || 0) + 1;
  });
  console.log('Employee Company IDs:', companyIds);
  process.exit(0);
}
check().catch(console.error);
