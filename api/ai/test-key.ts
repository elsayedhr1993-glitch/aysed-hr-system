import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';

const { loadBundledHandler } = createRequire(import.meta.url)('../_loadBundledCjs.cjs') as {
  loadBundledHandler: (bundleFileName: string) => (req: VercelRequest, res: VercelResponse) => Promise<unknown>;
};

let cachedHandler: ReturnType<typeof loadBundledHandler> | null = null;

function getHandler() {
  if (!cachedHandler) {
    cachedHandler = loadBundledHandler('test-key.cjs');
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return getHandler()(req, res);
}
