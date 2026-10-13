import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelBundleHandler } from './vercelLoadBundle';

export const config = {
  maxDuration: 60,
};

const handler = loadVercelBundleHandler('ocr-scan.cjs');

export default async function ocrScanRoute(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
