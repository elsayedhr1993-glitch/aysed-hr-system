import { useCallback, useState } from 'react';
import { useAiAssistantRequest } from './useAiAssistantRequest';
import { useCopilotContextOptional } from '../context/CopilotContext';
import { buildCopilotPayloadContext } from '../lib/aiCopilotContext';
import { normalizeAiFieldKind, type AiFieldKind } from '../lib/aiAssistTypes';
import { useCompany } from '../context/CompanyContext';
import { useEffectiveTenantCompanyId } from './useEffectiveTenantCompanyId';

export function useAiTextGenerate() {
  const { request } = useAiAssistantRequest();
  const [loading, setLoading] = useState(false);
  const copilotCtx = useCopilotContextOptional();
  const { activeCompany } = useCompany();
  const companyId = useEffectiveTenantCompanyId();

  const generate = useCallback(
    async (options: {
      instruction: string;
      fieldKind?: AiFieldKind;
      currentValue?: string;
      maxLength?: number;
      employees?: unknown[];
      contracts?: unknown[];
    }) => {
      const fieldKind = normalizeAiFieldKind(options.fieldKind);
      const instruction = String(options.instruction || '').trim();
      const seed = String(options.currentValue || '').trim();

      const defaultPrompt =
        instruction ||
        (seed
          ? `حسّن وصياغ النص التالي بأسلوب مهني مناسب لحقل «${fieldKind}».`
          : `اكتب نصاً مهنياً مناسباً لحقل «${fieldKind}» في نظام موارد بشرية كويتي.`);

      setLoading(true);
      try {
        const contextSummary = buildCopilotPayloadContext({
          company: activeCompany,
          employees: (options.employees as any[]) || copilotCtx?.runtime.employees || [],
          contracts: (options.contracts as any[]) || copilotCtx?.runtime.contracts || [],
          companyId,
          leaveSummary: copilotCtx?.runtime.leaveSummary,
          activeApp: copilotCtx?.activeApp,
          screen: copilotCtx?.screen,
          screenSummary: copilotCtx?.screenSummary,
        });

        return await request({
          mode: 'generate',
          prompt: defaultPrompt,
          companyId,
          contextSummary,
          activeApp: copilotCtx?.activeApp,
          screen: copilotCtx?.screen ?? undefined,
          screenSummary: copilotCtx?.screenSummary,
          fieldKind,
          currentValue: seed,
          maxLength: options.maxLength,
        });
      } finally {
        setLoading(false);
      }
    },
    [request, activeCompany, companyId, copilotCtx]
  );

  return { generate, loading };
}
