import { createRequire } from 'node:module';
import path from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

const requireFromRoot = createRequire(path.join(process.cwd(), 'package.json'));

function loadLoader(): { loadBundledHandler: (bundleFileName: string) => VercelHandler } {
  return requireFromRoot('./api/_loadBundledCjs.cjs') as {
    loadBundledHandler: (bundleFileName: string) => VercelHandler;
  };
}

export function loadVercelBundleHandler(bundleFileName: string): VercelHandler {
  const { loadBundledHandler } = loadLoader();
  const inner = loadBundledHandler(bundleFileName);
  return async (req, res) => {
    try {
      return await inner(req, res);
    } catch (err) {
      console.error(`[api/${bundleFileName}]`, err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'خطأ داخلي في خادم المساعد.',
          code: 'AI_UNAVAILABLE',
        });
      }
    }
  };
}
