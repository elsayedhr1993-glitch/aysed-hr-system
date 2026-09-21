import { getConnectivityTestModels } from '../src/config/aiConfig.ts';
import { requireFirebaseAuthFromHeader } from './apiAuth.ts';
import { getGeminiClient } from './geminiServer.ts';

export async function handleAiTestKeyRequest(
  authHeader: string | string[] | undefined
): Promise<{ status: number; body: Record<string, unknown> }> {
  try {
    const authCheck = await requireFirebaseAuthFromHeader(authHeader);
    if (authCheck.ok === false) {
      return { status: authCheck.status, body: { success: false, error: authCheck.error, code: 'UNAUTHORIZED' } };
    }

    const client = getGeminiClient();
    if (!client) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'مفتاح Gemini API غير مهيأ على الخادم. يرجى ضبط GEMINI_API_KEY في بيئة التشغيل.',
        },
      };
    }

    const modelsToTry = getConnectivityTestModels();
    let lastError: unknown = null;
    const startTime = Date.now();

    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: "مرحباً، قم بتأكيد فحص الاتصال بالرد بكلمة 'READY' فقط.",
        });
        const duration = Date.now() - startTime;
        if (response.text) {
          return {
            status: 200,
            body: {
              success: true,
              model: modelName,
              reply: response.text.trim(),
              responseTimeMs: duration,
              message: `تم الاتصال والتحقق بنجاح من محرك الذكاء الاصطناعي (${modelName}) خلال ${duration}ms.`,
            },
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    const details =
      lastError instanceof Error ? lastError.message : lastError ? String(lastError) : 'unknown';
    return {
      status: 500,
      body: {
        success: false,
        error: 'تعذر الاتصال بمحرك الذكاء الاصطناعي بمفتاح الخادم.',
        details,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 500, body: { success: false, error: message } };
  }
}
