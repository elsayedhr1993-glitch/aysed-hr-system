import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel' });
  }

  try {
    const model = process.env.AI_CHAT_MODEL || 'gemini-2.5-flash';
    const { prompt, contents, imageBase64, mimeType } = req.body || {};

    let parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    if (prompt) {
      parts.push({ text: prompt });
    }

    const payload = contents
      ? { contents }
      : { contents: [{ parts: parts.length > 0 ? parts : [{ text: 'مرحباً' }] }] };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    };

    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error('Gemini API Error Response:', data);
      return res.status(apiRes.status).json(data);
    }

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      text: responseText,
      candidates: data.candidates || [{ content: { parts: [{ text: responseText }] } }],
    });
  } catch (err: any) {
    console.error('Direct Gemini Handler Error:', err);
    return res.status(500).json({
      error: 'Failed to communicate with AI model',
      message: err?.message || String(err),
    });
  }
}
