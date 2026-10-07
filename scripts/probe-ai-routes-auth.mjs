import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

dotenv.config({ path: '.env' });

const base = process.env.PROBE_BASE_URL || 'http://localhost:3003';
const cfg = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  apiKey: cfg.apiKey,
  authDomain: cfg.authDomain,
  projectId: cfg.projectId,
});
const email = (process.env.ELITE_ADMIN_EMAIL || 'admin@elite.com').toLowerCase();
const password = process.env.ELITE_ADMIN_RESET_PASSWORD || '20262026';

const cred = await signInWithEmailAndPassword(getAuth(app), email, password);
const token = await cred.user.getIdToken();
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function post(path, body) {
  const res = await fetch(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json };
}

const testKey = await post('/api/ai/test-key', {});
console.log('test-key', testKey.status, testKey.json.success, testKey.json.error || testKey.json.details?.slice?.(0, 120));

const chat = await post('/api/ai-chat', {
  prompt: 'رد بكلمة: تم',
  companyId: 'comp-1788435917695',
});
console.log('ai-chat', chat.status, chat.json.success, chat.json.error || chat.json.reply?.slice?.(0, 80));
