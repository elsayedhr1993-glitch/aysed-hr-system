import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 120,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, message, history } = req.body || {};
    const userMessage = prompt || message;

    if (!userMessage) {
      return res.status(400).json({ error: 'Prompt or message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
    });

    return res.status(200).json({
      success: true,
      reply: response.text,
      text: response.text,
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
