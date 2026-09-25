import fs from 'fs';
import path from 'path';
import type { PamFontChoice } from '../src/services/pamContractPdfService.ts';

function fontCandidatePaths(fontChoice: PamFontChoice): string[] {
  return fontChoice === 'cairo'
    ? ['fonts/Cairo-Bold.ttf', 'fonts/Cairo-Regular.ttf', 'fonts/Amiri-Bold.ttf', 'fonts/Amiri-Regular.ttf']
    : ['fonts/Amiri-Bold.ttf', 'fonts/Amiri-Regular.ttf', 'fonts/Cairo-Bold.ttf', 'fonts/Cairo-Regular.ttf'];
}

/** Node-only: load Arabic TTF from public/ for API PAM generation */
export function loadPamFontBytesSync(fontChoice: PamFontChoice = 'cairo'): Uint8Array {
  for (const rel of fontCandidatePaths(fontChoice)) {
    const full = path.join(process.cwd(), 'public', rel);
    if (fs.existsSync(full)) {
      const buf = fs.readFileSync(full);
      if (buf.byteLength > 10000) {
        return new Uint8Array(buf);
      }
    }
  }
  throw new Error(`Arabic font files not found under public/fonts for ${fontChoice}`);
}
