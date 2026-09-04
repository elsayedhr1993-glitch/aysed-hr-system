import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function test() {
  const companyId = 'comp-super-admin';
  const q = query(collection(db, 'employees'), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  console.log(`Employees for ${companyId}: ${snap.size}`);
  snap.forEach(d => console.log(d.data()));
  process.exit(0);
}
test();
