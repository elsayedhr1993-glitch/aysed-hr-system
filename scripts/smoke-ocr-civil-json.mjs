/**
 * Smoke-test Vision OCR JSON (same models/env as /api/ocr-scan).
 * Usage: node scripts/smoke-ocr-civil-json.mjs [imagePath]
 */
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Type } from '@google/genai';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const imagePath = resolve(process.argv[2] || 'public/kuwait_emblem.png');

const { getGeminiClient } = await import('../server/geminiServer.ts');
const ai = getGeminiClient();
if (!ai) {
  console.error('FAIL: GEMINI_API_KEY missing or getGeminiClient() null');
  process.exit(1);
}

const model =
  process.env.AI_OCR_MODEL?.trim() ||
  process.env.AI_CHAT_MODEL?.trim() ||
  'gemini-3.8-flash';

const b64 = readFileSync(imagePath).toString('base64');
const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

const systemPrompt = `استخرج حقول البطاقة المدنية الكويتية بصيغة JSON فقط. إذا لم تظهر بطاقة مدنية، أرجع الحقول فارغة.`;

try {
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: b64, mimeType } },
        { text: systemPrompt },
      ],
    },
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          civilId: { type: Type.STRING },
          fullNameAr: { type: Type.STRING },
          fullNameEn: { type: Type.STRING },
          nationality: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
        },
      },
    },
  });

  const raw = (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(raw);
  console.log('PASS: OCR JSON parsed via', model);
  console.log(JSON.stringify(parsed, null, 2));
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e?.message || e);
  process.exit(1);
}
