import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requestIp } from '../auditLog';
import { handleAiChatRequest } from '../aiChatCore';
import { getGeminiClient } from '../geminiServer';

export const config = {
  maxDuration: 60,
};

async function aiChatVercelHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'طريقة الطلب غير مدعومة.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  const result = await handleAiChatRequest(req.body, req.headers.authorization, getGeminiClient, {
    ip: requestIp(req),
  });
  return res.status(result.status).json(result.body);
}

export default aiChatVercelHandler;
