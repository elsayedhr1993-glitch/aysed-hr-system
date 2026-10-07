import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadBundledHandler } from './loadBundledCjs';

let cachedHandler: ReturnType<typeof loadBundledHandler> | null = null;

function getHandler() {
  if (!cachedHandler) {
    cachedHandler = loadBundledHandler('ai-chat.cjs');
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return getHandler()(req, res);
}
