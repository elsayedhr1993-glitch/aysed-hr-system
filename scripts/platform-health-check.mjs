/**
 * Local + production smoke checks (no secrets printed).
 * Usage: node scripts/platform-health-check.mjs [--prod]
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const prod = process.argv.includes('--prod');
const base = prod ? 'https://aysed-hr-system.vercel.app' : 'http://localhost:3000';

function maskKeyPresent() {
  const k = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  if (!k || k.includes('YOUR_') || k.includes('MY_GEMINI')) return false;
  return k.length > 10;
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body };
}

async function main() {
  console.log(`\n=== Platform health (${prod ? 'production' : 'local'}) ===`);
  console.log('Base URL:', base);
  console.log('GEMINI_API_KEY configured:', maskKeyPresent() ? 'yes' : 'no');
  console.log(
    'FIREBASE_SERVICE_ACCOUNT:',
    (process.env.FIREBASE_SERVICE_ACCOUNT || '').length > 50 ? 'yes' : 'no'
  );

  try {
    const env = await fetchJson(`${base}/api/system/env-health`);
    console.log('\n/api/system/env-health:', env.status, env.body?.firebase?.adminReady ?? env.body);
  } catch (e) {
    console.log('\n/api/system/env-health: unreachable', e?.message || e);
  }

  const aiOpts = await fetchJson(`${base}/api/ai-chat`, { method: 'OPTIONS' });
  console.log('\n/api/ai-chat OPTIONS:', aiOpts.status, aiOpts.body?.code || aiOpts.body?.raw?.slice?.(0, 80));

  const aiPost = await fetchJson(`${base}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'ping', companyId: 'health-check' }),
  });
  console.log('/api/ai-chat POST (no auth):', aiPost.status, aiPost.body?.code || aiPost.body?.error || aiPost.body?.raw?.slice?.(0, 80));

  const keyPost = await fetchJson(`${base}/api/ai/test-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  console.log('/api/ai/test-key POST (no auth):', keyPost.status, keyPost.body?.code || keyPost.body?.error || keyPost.body?.raw?.slice?.(0, 80));

  if (maskKeyPresent() && !prod) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
      await ai.models.generateContent({
        model: process.env.AI_CHAT_MODEL || 'gemini-3.8-flash',
        contents: { parts: [{ text: 'OK' }] },
      });
      console.log('\nGemini direct API: PASS');
    } catch (e) {
      const msg = e?.message || String(e);
      console.log('\nGemini direct API: FAIL', msg.slice(0, 120));
    }
  }

  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
