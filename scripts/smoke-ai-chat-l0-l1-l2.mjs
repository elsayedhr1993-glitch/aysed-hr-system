/**
 * Quick L0/L1/L2 copilot smoke (max 10s per step). Prefer UI testing via `npm run dev`.
 * Usage: node scripts/smoke-ai-chat-l0-l1-l2.mjs
 * Env: ELITE_ADMIN_EMAIL, ELITE_ADMIN_RESET_PASSWORD, optional SMOKE_COMPANY_ID
 */
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const PER_CALL_MS = 10_000;

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
    }),
  ]);
}

const PROMPTS = [
  { level: 'L0', prompt: 'كم موظف عندي' },
  { level: 'L1', prompt: 'اعرض قائمة وثائق منتهية' },
  { level: 'L2', prompt: 'افتح حاسبة الموارد البشرية' },
];

async function main() {
  const companyId = process.env.SMOKE_COMPANY_ID || 'comp-1788435917695';
  const email = (process.env.ELITE_ADMIN_EMAIL || 'admin@elite.com').toLowerCase();
  const password = process.env.ELITE_ADMIN_RESET_PASSWORD || '20262026';

  const cfg = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
  const app = initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
  });

  try {
    const cred = await withTimeout(
      signInWithEmailAndPassword(getAuth(app), email, password),
      PER_CALL_MS,
      'Firebase sign-in'
    );
    const token = `Bearer ${await cred.user.getIdToken()}`;
    const { handleAiChatRequest } = await import('../server/aiChatCore.ts');

    let failed = false;
    for (const { level, prompt } of PROMPTS) {
      try {
        const result = await withTimeout(
          handleAiChatRequest({ prompt, companyId, mode: 'chat' }, token),
          PER_CALL_MS,
          `${level}: ${prompt}`
        );
        const snippet = String(result.body?.reply || result.body?.error || '').slice(0, 120);
        console.log(`${level} ${result.status} ${result.body?.source || '-'} | ${snippet}`);
        if (result.status >= 400) failed = true;
      } catch (err) {
        console.error(`${level} FAIL:`, err?.message || err);
        failed = true;
      }
    }

    process.exit(failed ? 1 : 0);
  } finally {
    await deleteApp(app).catch(() => {});
  }
}

main().catch((err) => {
  console.error('FAIL:', err?.message || err);
  process.exit(1);
});
