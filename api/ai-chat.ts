import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

const aiChatHandler = require('./ai-chat.cjs') as VercelHandler;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return aiChatHandler(req, res);
}
