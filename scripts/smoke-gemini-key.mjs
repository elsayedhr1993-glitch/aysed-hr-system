import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  console.error('FAIL: GEMINI_API_KEY missing in .env');
  process.exit(1);
}

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });
const model = process.env.AI_CHAT_MODEL || 'gemini-3.8-flash';

try {
  const res = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: 'Reply with exactly: OK' }] },
  });
  const text = (res.text || '').trim();
  console.log('PASS: Gemini responded via model', model);
  console.log('Reply snippet:', text.slice(0, 80));
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e?.message || e);
  process.exit(1);
}
