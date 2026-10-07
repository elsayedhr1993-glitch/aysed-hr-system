import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

declare const __dirname: string | undefined;

function resolveFunctionDir(): string {
  if (typeof __dirname === 'string' && __dirname.length > 0) {
    return __dirname;
  }
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return path.join(process.cwd(), 'api');
  }
}

/** Load esbuild CJS bundle colocated with the Vercel function entry (see scripts/bundle-vercel-ai.mjs). */
export function loadBundledHandler(bundleFileName: string): VercelHandler {
  const functionDir = resolveFunctionDir();
  const candidates = [
    path.join(functionDir, bundleFileName),
    path.join(process.cwd(), 'api', bundleFileName),
    path.join(process.cwd(), 'api', 'ai', bundleFileName),
    path.join(process.cwd(), bundleFileName),
  ];

  for (const bundlePath of candidates) {
    if (!fs.existsSync(bundlePath)) continue;
    try {
      const req = createRequire(bundlePath);
      const mod = req(bundlePath) as { default?: VercelHandler } | VercelHandler;
      const handler = typeof mod === 'function' ? mod : mod?.default;
      if (typeof handler === 'function') {
        return handler;
      }
    } catch (err) {
      console.error(`[loadBundledCjs] failed to load ${bundlePath}`, err);
    }
  }

  console.error('[loadBundledCjs] bundle not found', { bundleFileName, candidates });

  return async (_req, res) => {
    res.status(503).json({
      success: false,
      error:
        'حزمة خادم الذكاء الاصطناعي غير متوفرة على هذا النشر. أعد النشر بعد npm run build (bundle-vercel-ai).',
      code: 'BUNDLE_MISSING',
      bundle: bundleFileName,
    });
  };
}
