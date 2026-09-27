import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { getGeminiClient } from '../server/geminiServer.ts';

const path = process.argv[2];
if (!path) throw new Error('Usage: npx tsx scripts/ocr-pdf-once.ts <pdfPath>');

const client = getGeminiClient();
if (!client) throw new Error('No GEMINI');

const b64 = readFileSync(path).toString('base64');
const r = await client.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: {
    parts: [
      { inlineData: { data: b64, mimeType: 'application/pdf' } },
      {
        text:
          'Extract Kuwait civil ID data as JSON object: fullNameAr, fullNameEn, civilId, passportNo, nationality, gender, dob, expiryDate, profession, address',
      },
    ],
  },
  config: { temperature: 0, responseMimeType: 'application/json' },
});
console.log(r.text);
