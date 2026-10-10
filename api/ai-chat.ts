import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel environment' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.AI_CHAT_MODEL || 'gemini-3.8-flash';

    const { prompt, contents, imageBase64, mimeType } = req.body || {};

    let payloadParts: any[] = [];

    if (imageBase64) {
      payloadParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    if (prompt) {
      payloadParts.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model,
      contents: contents || (payloadParts.length > 0 ? payloadParts : [{ text: 'مرحباً' }]),
    });

    const responseText = response.text || '';

    return res.status(200).json({
      text: responseText,
      candidates: [{ content: { parts: [{ text: responseText }] } }],
    });
  } catch (error: any) {
    console.error('Gemini API Invocation Error:', error);
    return res.status(500).json({
      error: 'Failed to process AI request',
      message: error?.message || String(error),
    });
  }
}
