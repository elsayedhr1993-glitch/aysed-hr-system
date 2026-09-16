import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const cfg = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig = {
  apiKey: cfg.apiKey,
  authDomain: cfg.authDomain,
  projectId: cfg.projectId,
  storageBucket: cfg.storageBucket,
  messagingSenderId: cfg.messagingSenderId,
  appId: cfg.appId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, cfg.firestoreDatabaseId || '(default)');

const collectionsToWipe = [
  'companies',
  'subscriptions',
  'subscription_requests',
  'employees',
  'contracts',
  'commencements',
  'attendance',
  'leaves',
  'payroll_runs',
  'payslips',
  'allocations',
  'work_on_holidays',
  'company_settings',
  'settings'
];

async function wipe() {
  console.log('Starting full database wipe...');
  for (const colName of collectionsToWipe) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Collection '${colName}': found ${snap.docs.length} documents.`);
      for (const d of snap.docs) {
        try {
          await deleteDoc(doc(db, colName, d.id));
          console.log(`Deleted ${colName}/${d.id}`);
        } catch (e) {
          console.error(`Failed to delete ${colName}/${d.id}:`, e);
        }
      }
    } catch (err) {
      console.error(`Error querying collection '${colName}':`, err);
    }
  }
  console.log('Wipe complete.');
  process.exit(0);
}

wipe();
