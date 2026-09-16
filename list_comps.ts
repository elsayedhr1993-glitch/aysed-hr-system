import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function list() {
  const querySnapshot = await getDocs(collection(db, 'companies'));
  querySnapshot.forEach(doc => {
    console.log(`Company ID: ${doc.id} | Name: ${doc.data().nameAr || doc.data().name}`);
  });
  process.exit(0);
}
list().catch(console.error);
