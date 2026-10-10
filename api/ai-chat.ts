import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function getBundleHandler() {
  const bundlePath = path.resolve(process.cwd(), 'api/_bundles/ai-chat.cjs');
  const mod = require(bundlePath);
  return mod.default || mod;
}

let cachedHandler: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!cachedHandler) {
      cachedHandler = getBundleHandler();
    }
    return await cachedHandler(req, res);
  } catch (err: any) {
    // محاولة احتياطية في حال اختلف مسار التشغيل داخل Vercel
    try {
      const fallbackMod = require('./_bundles/ai-chat.cjs');
      const fallbackHandler = fallbackMod.default || fallbackMod;
      return await fallbackHandler(req, res);
    } catch (fallbackErr: any) {
      console.error('Failed to load bundle:', err, fallbackErr);
      return res.status(500).json({
        error: 'Failed to load AI bundle',
        details: err?.message || String(err),
      });
    }
  }
}
