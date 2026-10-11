import fs from 'node:fs';

const path = 'server.ts';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

// Remove OCR rate-limit block (0-based: 295-360)
lines.splice(295, 66);

// After first splice, OCR block starts at 826-66=760? Recalculate by marker
const startIdx = lines.findIndex((l) => l.includes('// OCR Document Scanner via OpenAI'));
const endIdx = lines.findIndex((l) => l.includes('// Odoo Enterprise AI Copilot Chat Endpoint'));
if (startIdx < 0 || endIdx < 0) {
  console.error('markers not found', { startIdx, endIdx });
  process.exit(1);
}
lines.splice(startIdx, endIdx - startIdx);

const importLine = 'import { registerOcrScanRoute } from "./server/ocrScanRoute.ts";';
if (!lines.some((l) => l.includes('registerOcrScanRoute'))) {
  const regIdx = lines.findIndex((l) => l.includes('registerCopilotExecuteRoute'));
  if (regIdx >= 0) {
    lines.splice(regIdx + 1, 0, importLine);
  }
}

const callLine = 'registerOcrScanRoute(app);';
if (!lines.some((l) => l.trim() === callLine)) {
  const aiIdx = lines.findIndex((l) => l.includes('registerAiChatRoute(app)'));
  if (aiIdx >= 0) {
    lines.splice(aiIdx + 1, 0, callLine);
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('stripped OCR from server.ts');
