import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const path = process.argv[2];
if (!path) throw new Error('Usage: npx tsx scripts/pdf-text-dump.ts <pdf>');

const require = createRequire(import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

const data = new Uint8Array(readFileSync(path));
const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map((it: { str?: string }) => it.str ?? '').join(' ');
  console.log(`\n--- page ${i} ---\n${text}`);
}
