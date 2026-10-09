import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { getGeminiClient } from '../server/geminiServer.ts';

const path = process.argv[2];
if (!path) throw new Error('Usage: npx tsx scripts/extract-payroll-pdf.ts <pdfPath>');

const client = getGeminiClient();
if (!client) throw new Error('No GEMINI_API_KEY');

const models = ['gemini-3.8-flash', 'gemini-3-flash-preview'];

const b64 = readFileSync(path).toString('base64');
const prompt = `This is a Kuwait clinic payroll sheet (كشف رواتب) for Elite Clinic, August 2026.
Extract EVERY employee row as JSON array. Each object:
{
  "nameAr": "",
  "nameEn": "",
  "civilId": "12 digits if visible else null",
  "basicSalary": number,
  "housingAllowance": number,
  "transportAllowance": number,
  "otherAllowance": number,
  "totalAllowances": number,
  "totalSalary": number,
  "notes": "any column labels you used"
}
Use 0 for missing allowance columns. Match Arabic names exactly as on sheet.
Return ONLY valid JSON: { "rows": [ ... ] }`;

let lastErr: unknown;
for (const model of models) {
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
    console.log(JSON.stringify({ model, text: r.text }, null, 2));
    process.exit(0);
  } catch (e) {
    lastErr = e;
    console.error(`model ${model} failed:`, (e as Error).message);
  }
}
throw lastErr;
