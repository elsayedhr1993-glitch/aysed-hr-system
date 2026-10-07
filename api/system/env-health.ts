import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth } from '../../server/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const geminiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
  const hasGemini = geminiKey.length > 10 && !geminiKey.includes('YOUR_');

  const sa = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  const hasServiceAccount = sa.length > 50 && !sa.includes('YOUR_');

  let supabasePing: { success: boolean; statusText: string } = { success: false, statusText: 'skipped' };
  const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const anon = process.env.VITE_SUPABASE_ANON_KEY || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const cleanUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  if (cleanUrl && (anon || service)) {
    try {
      const pingRes = await fetch(`${cleanUrl}/auth/v1/settings`, {
        headers: {
          apikey: anon || service,
          Authorization: `Bearer ${anon || service}`,
        },
      });
      supabasePing = {
        success: pingRes.ok,
        statusText: pingRes.ok ? `HTTP ${pingRes.status} OK` : `HTTP ${pingRes.status} ${pingRes.statusText}`,
      };
    } catch (e: unknown) {
      supabasePing = { success: false, statusText: e instanceof Error ? e.message : String(e) };
    }
  }

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'vercel',
    gemini: { configured: hasGemini },
    supabase: {
      url: cleanUrl || null,
      hasAnonKey: Boolean(anon),
      hasServiceRole: Boolean(service),
      livePing: supabasePing,
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0326692360',
      firestoreDatabaseId:
        process.env.FIRESTORE_DATABASE_ID ||
        'ai-studio-remixaysedshr202-98c882d5-9491-4f4b-a838-c6b0b10a0472',
      hasServiceAccount,
      adminReady: Boolean(getAdminAuth()),
    },
  });
}
