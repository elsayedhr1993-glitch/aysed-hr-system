/**
 * Verify client Firebase Auth sign-in (same project as firebase-applet-config.json).
 * Usage: npx tsx scripts/verify-elite-client-login.ts
 * Password from ELITE_ADMIN_RESET_PASSWORD or default in repair script.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const cfg = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  apiKey: cfg.apiKey,
  authDomain: cfg.authDomain,
  projectId: cfg.projectId,
});
const auth = getAuth(app);

const email = (process.env.ELITE_ADMIN_EMAIL || 'admin@elite.com').toLowerCase();
const password = process.env.ELITE_ADMIN_RESET_PASSWORD || '20262026';

try {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log(JSON.stringify({ ok: true, uid: cred.user.uid, email: cred.user.email }, null, 2));
} catch (e: any) {
  console.log(JSON.stringify({ ok: false, code: e?.code, message: e?.message }, null, 2));
  process.exit(1);
}
