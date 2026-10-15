import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelBundleHandler } from './vercelLoadBundle';

export const config = {
  maxDuration: 60,
};

const chatHandler = loadVercelBundleHandler('ai-chat.cjs');

/** Vercel Node.js handler: default export (req, res) for POST /api/chat. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  return chatHandler(req, res);
}
