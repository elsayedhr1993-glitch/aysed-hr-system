import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAiTestKeyRequest } from '../../server/aiTestKeyCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const result = await handleAiTestKeyRequest(req.headers.authorization);
  return res.status(result.status).json(result.body);
}
