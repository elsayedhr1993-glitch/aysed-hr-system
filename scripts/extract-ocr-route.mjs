import fs from 'node:fs';

const lines = fs.readFileSync('server.ts', 'utf8').split(/\r?\n/);
const header = `import type { Express, Request, Response } from 'express';
import express from 'express';
import { Type } from '@google/genai';
import { getOcrModelCandidates } from '../src/config/aiConfig.ts';
import { parseJsonFromAiText } from '../src/utils/ocrJsonParse.ts';
import { requireFirebaseAuthFromHeader } from './apiAuth.ts';
import { getGeminiClient } from './geminiServer.ts';

`;
const helpers = lines.slice(295, 361).join('\n');
const normalize = lines.slice(826, 933).join('\n');
let handler = lines.slice(934, 1318).join('\n');
handler = handler.replace(
  'app.post("/api/ocr-scan", express.json({ limit: "50mb" }), async (req, res) => {',
  'export async function handleOcrScanHttp(req: Request, res: Response) {'
);
handler = handler.replace(
  /const authCheck = await requireFirebaseAuth\(req, res\);\s*\r?\n\s*if \(!authCheck\.ok\) \{\s*\r?\n\s*return res\.status\(401\)\.json\(\{ success: false, error: authCheck\.error \}\);\s*\r?\n\s*\}/,
  `const authCheck = await requireFirebaseAuthFromHeader(req.headers?.authorization || req.headers?.Authorization);
  if (!authCheck.ok) {
    return res.status(authCheck.status).json({ success: false, error: authCheck.error });
  }`
);
const footer = `\n\nexport function registerOcrScanRoute(app: Express) {
  app.post('/api/ocr-scan', express.json({ limit: '50mb' }), handleOcrScanHttp);
}\n`;
fs.writeFileSync('server/ocrScanRoute.ts', header + helpers + '\n' + normalize + '\n' + handler + footer);
console.log('wrote server/ocrScanRoute.ts');
