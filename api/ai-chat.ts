import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // محاولة استدعاء المعالج مباشرة من كود السيرفر الأصلي لتفادي تعارض jwks/jose
    const serverMod = await import('../server.js').catch(() => import('../server/index.js'));
    const app = serverMod.default || serverMod.app || serverMod;
    
    if (typeof app === 'function') {
      return app(req, res);
    }

    // بديل مباشر: استيراد الحزمة كـ dynamic import لتجاوز قيود require(ESM)
    const bundleMod = await import('./_bundles/ai-chat.cjs');
    const bundleHandler = bundleMod.default || bundleMod;
    return await bundleHandler(req, res);
  } catch (err: any) {
    console.error('AI Chat Handler Error:', err);
    return res.status(500).json({
      error: 'AI Chat invocation error',
      message: err?.message || String(err),
    });
  }
}
