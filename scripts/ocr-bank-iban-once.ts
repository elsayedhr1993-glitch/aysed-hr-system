import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { getGeminiClient } from '../server/geminiServer.ts';

const path = process.argv[2];
if (!path) throw new Error('Usage: npx tsx scripts/ocr-bank-iban-once.ts <pdfPath>');

const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.1-pro-preview',
];

const client = getGeminiClient();
if (!client) throw new Error('GEMINI_API_KEY required');

const b64 = readFileSync(path).toString('base64');
const prompt = `Kuwait bank account / IBAN letter for a company or clinic.
Return JSON only:
bankNameAr, bankNameEn, accountNumber, iban (full KW IBAN, no spaces),
accountHolderNameAr, branch, currency, wpsBankCode (3-letter Kuwait WPS code if visible),
issueDate (YYYY-MM-DD), notes, confidence (high|medium|low).
Use empty string for unknown. Do not invent digits.`;

let last: unknown;
for (const model of MODELS) {
  try {
    const r = await client.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: b64, mimeType: 'application/pdf' } },
          { text: prompt },
        ],
      },
      config: { temperature: 0, responseMimeType: 'application/json' },
    });
    console.log(JSON.stringify({ model, data: JSON.parse(r.text || '{}') }, null, 2));
    process.exit(0);
  } catch (e) {
    last = e;
    console.error(`[${model}]`, e instanceof Error ? e.message : e);
  }
}
throw last instanceof Error ? last : new Error(String(last));
