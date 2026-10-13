import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOcrScanHttp } from '../ocrScanRoute';

export const config = {
  maxDuration: 60,
};

async function ocrScanVercelHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  return handleOcrScanHttp(
    req as Parameters<typeof handleOcrScanHttp>[0],
    res as unknown as Parameters<typeof handleOcrScanHttp>[1]
  );
}

export default ocrScanVercelHandler;
