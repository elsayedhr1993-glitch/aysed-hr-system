import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelBundleHandler } from './vercelLoadBundle';

export const config = {
  maxDuration: 60,
};

const handler = loadVercelBundleHandler('ai-chat.cjs');

export default async function aiChatRoute(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
