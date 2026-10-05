import { useCallback, useMemo } from 'react';
import { useCopilotContext } from '../context/CopilotContext';
import { executeCopilotAction } from '../lib/copilotActionRegistry';
import type { CopilotAction } from '../lib/aiCopilotTypes';
import { useLang } from '../lib/i18n';

export function useCopilotActionExecutor() {
  const { runtime, close } = useCopilotContext();
  const { lang } = useLang();
  const isArabic = lang === 'ar';

  const execute = useCallback(
    async (action: CopilotAction) => executeCopilotAction(action, { runtime, close, isArabic }),
    [runtime, close, isArabic]
  );

  return useMemo(() => ({ execute }), [execute]);
}
