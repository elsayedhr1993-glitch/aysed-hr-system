import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function main() {
  const companies = await getDocs(collection(db, 'companies'));
  console.log('--- companies ---');
  companies.forEach((d) => {
    const v = d.data();
    console.log({
      id: d.id,
      nameAr: v.nameAr || v.name,
      pam: v.pamFileNumber,
      admin: v.adminUsername || v.email,
    });
  });

  const users = await getDocs(collection(db, 'users'));
  console.log('--- users ---');
  users.forEach((d) => {
    const v = d.data();
    console.log({
      id: d.id,
      email: v.email,
      role: v.role,
      companyId: v.companyId,
    });
  });
}

main().catch(console.error);
