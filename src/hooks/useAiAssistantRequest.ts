import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../lib/i18n';
import type { AiAssistMode } from '../lib/aiAssistTypes';

export interface AiAssistantRequestInput {
  mode: AiAssistMode;
  prompt: string;
  companyId?: string;
  contextSummary?: string;
  activeApp?: string;
  screen?: Record<string, unknown> | null;
  screenSummary?: string;
  fieldKind?: string;
  currentValue?: string;
  maxLength?: number;
  entityType?: string;
  entityId?: string;
  entityBundle?: string;
}

export interface AiAssistantResult {
  success: boolean;
  reply?: string;
  source?: string;
  error?: string;
  code?: string;
}

export function useAiAssistantRequest() {
  const { token } = useAuth();
  const { lang } = useLang();
  const isArabic = lang === 'ar';

  const request = useCallback(
    async (input: AiAssistantRequestInput): Promise<AiAssistantResult> => {
      if (!input.companyId) {
        return {
          success: false,
          error: isArabic ? 'اختر شركة نشطة أولاً.' : 'Select an active company first.',
          code: 'VALIDATION_ERROR',
        };
      }
      const prompt = String(input.prompt || '').trim();
      if (!prompt && input.mode !== 'summarize') {
        return {
          success: false,
          error: isArabic ? 'اكتب طلباً أو تعليمات للصياغة.' : 'Enter a prompt or instructions.',
          code: 'VALIDATION_ERROR',
        };
      }

      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            mode: input.mode,
            prompt: prompt || (input.mode === 'summarize' ? 'لخّص الحالة الإدارية للموظف بشكل مهني ومختصر.' : prompt),
            companyId: input.companyId,
            contextSummary: input.contextSummary,
            activeApp: input.activeApp,
            screen: input.screen,
            screenSummary: input.screenSummary,
            fieldKind: input.fieldKind,
            currentValue: input.currentValue,
            maxLength: input.maxLength,
            entityType: input.entityType,
            entityId: input.entityId,
            entityBundle: input.entityBundle,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        let data: Record<string, unknown> = {};
        const rawBody = await response.text();
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(rawBody) as Record<string, unknown>;
          } catch {
            data = {};
          }
        }
        if (!contentType.includes('application/json') || Object.keys(data).length === 0) {
          const serverHint =
            response.status >= 500
              ? isArabic
                ? 'خادم /api/ai-chat فشل (أعد النشر بعد npm run build).'
                : '/api/ai-chat server error (redeploy after npm run build).'
              : isArabic
                ? 'استجابة غير متوقعة من الخادم.'
                : 'Unexpected server response.';
          return {
            success: false,
            error: serverHint,
            code: response.status >= 500 ? 'AI_UNAVAILABLE' : 'API_ROUTE_UNAVAILABLE',
          };
        }

        if (!response.ok || !data.success) {
          const code = String(data.code || '');
          let error = String(data.error || (isArabic ? 'تعذر إكمال الطلب.' : 'Request failed.'));
          if (code === 'AI_NOT_CONFIGURED' || code === 'BUNDLE_MISSING') {
            error = isArabic
              ? 'المساعد غير مهيأ على الخادم. أضف GEMINI_API_KEY أو GOOGLE_API_KEY في إعدادات Vercel ثم أعد النشر.'
              : 'Assistant is not configured on the server. Set GEMINI_API_KEY or GOOGLE_API_KEY in Vercel and redeploy.';
          } else if (code === 'API_ROUTE_UNAVAILABLE') {
            error = isArabic
              ? 'مسار /api/ai-chat غير متاح. تأكد من نشر المشروع على Vercel مع npm run build.'
              : '/api/ai-chat is unavailable. Deploy to Vercel with a full production build.';
          }
          return {
            success: false,
            error,
            code,
          };
        }

        return {
          success: true,
          reply: String(data.reply || '').trim(),
          source: String(data.source || ''),
        };
      } catch {
        return {
          success: false,
          error: isArabic
            ? 'تعذر الاتصال بالمساعد (شبكة أو مهلة Vercel). تحقق من الاتصال وحاول مجدداً.'
            : 'Could not reach the assistant (network or Vercel timeout). Check connectivity and retry.',
          code: 'AI_UNAVAILABLE',
        };
      }
    },
    [token, isArabic]
  );

  return { request };
}
