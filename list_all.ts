import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function list() {
  const querySnapshot = await getDocs(collection(db, 'employees'));
  console.log(`Found ${querySnapshot.size} employees in db:`);
  querySnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Name: ${data.fullNameAr || data.nameAr} | Company: ${data.companyId}`);
  });
  process.exit(0);
}
list().catch(console.error);
