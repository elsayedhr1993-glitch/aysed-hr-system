import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';
import path from 'node:path';

export const config = {
  maxDuration: 120,
};

const require = createRequire(import.meta.url);

function loadBundledHandler(bundleFileName: string) {
  const possiblePaths = [
    path.join(process.cwd(), 'api', '_bundles', bundleFileName),
    path.join(process.cwd(), '_bundles', bundleFileName),
    path.join(process.cwd(), bundleFileName),
    path.resolve('./api/_bundles', bundleFileName),
    path.resolve('./_bundles', bundleFileName)
  ];

  let bundleModule: any = null;
  for (const bundlePath of possiblePaths) {
    try {
      bundleModule = require(bundlePath);
      break;
    } catch (e) {
      // الاستمرار في البحث حتى إيجاد المسار الصحيح
    }
  }

  if (!bundleModule) {
    try {
      bundleModule = require(`./_bundles/${bundleFileName}`);
    } catch (err) {
      throw new Error(`Could not locate bundled CJS file: ${bundleFileName}`);
    }
  }

  return bundleModule.default || bundleModule.handler || bundleModule;
}

let cachedHandler: any = null;

function getHandler() {
  if (!cachedHandler) {
    cachedHandler = loadBundledHandler('ai-chat.cjs');
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const h = getHandler();
  return h(req, res);
}
