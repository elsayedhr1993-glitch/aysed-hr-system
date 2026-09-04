import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function test() {
  const q = collection(db, 'companies');
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} companies in db:`);
  snap.forEach(d => console.log(`ID: ${d.id} | Name: ${d.data().nameAr}`));
  process.exit(0);
}
test();
