import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

// We can't really simulate the React state easily from Node without JSDOM,
// but we can check what the database says about the user.
import { getFirestore, doc, getDoc } from 'firebase/firestore';
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function check() {
  const userDocs = await getDoc(doc(db, 'users', 'comp-super-admin'));
  console.log('Admin company exists?', userDocs.exists());
  process.exit(0);
}
check().catch(console.error);
