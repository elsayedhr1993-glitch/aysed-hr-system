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
        if (contentType.includes('application/json')) {
          data = (await response.json()) as Record<string, unknown>;
        } else {
          return {
            success: false,
            error: isArabic ? 'استجابة غير متوقعة من الخادم.' : 'Unexpected server response.',
            code: 'API_ROUTE_UNAVAILABLE',
          };
        }

        if (!response.ok || !data.success) {
          return {
            success: false,
            error: String(data.error || (isArabic ? 'تعذر إكمال الطلب.' : 'Request failed.')),
            code: String(data.code || ''),
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
          error: isArabic ? 'تعذر الاتصال بالمساعد.' : 'Could not reach the assistant.',
          code: 'AI_UNAVAILABLE',
        };
      }
    },
    [token, isArabic]
  );

  return { request };
}
