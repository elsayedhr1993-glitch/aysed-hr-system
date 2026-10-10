import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let cachedHandler: any = null;

function getHandler() {
  if (!cachedHandler) {
    const helperPath = path.resolve(process.cwd(), 'api/_loadBundledCjs.cjs');
    const { loadBundledHandler } = require(helperPath);
    cachedHandler = loadBundledHandler('ai-chat.cjs');
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const h = getHandler();
    return await h(req, res);
  } catch (err: any) {
    console.error('AI Chat Invocation Error:', err);
    return res.status(500).json({
      error: 'Failed to process AI chat/OCR request',
      details: err?.message || String(err),
    });
  }
}
