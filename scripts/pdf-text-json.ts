import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const path = process.argv[2];
const out = process.argv[3] || 'tmp-pdf-text.json';
if (!path) throw new Error('Usage: npx tsx scripts/pdf-text-json.ts <pdf> [out.json]');

const require = createRequire(import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

const data = new Uint8Array(readFileSync(path));
const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
const pages: string[] = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  pages.push(content.items.map((it: { str?: string }) => it.str ?? '').join(' '));
}
writeFileSync(out, JSON.stringify({ pages }, null, 2), 'utf8');
console.log('wrote', out, 'pages', pages.length);
