import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function check() {
  const q = collection(db, 'companies');
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Company ID: ${doc.id}, Name: ${data.nameAr || data.nameEn}, Email: ${data.email || data.ownerEmail}`);
  });
  process.exit(0);
}
check().catch(console.error);
