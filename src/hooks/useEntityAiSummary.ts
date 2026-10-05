import { useCallback, useState } from 'react';
import { useAiAssistantRequest } from './useAiAssistantRequest';
import { buildEmployeeAdminSummaryBundle } from '../lib/buildEntitySummaryBundle';
import { useEffectiveTenantCompanyId } from './useEffectiveTenantCompanyId';

export function useEntityAiSummary() {
  const { request } = useAiAssistantRequest();
  const companyId = useEffectiveTenantCompanyId();
  const [loading, setLoading] = useState(false);

  const summarizeEmployee = useCallback(
    async (input: {
      employee: Record<string, unknown>;
      leaveRequests?: Array<Record<string, unknown>>;
      leaveAllocations?: Array<Record<string, unknown>>;
      commencementRecord?: Record<string, unknown> | null;
    }) => {
      const entityId = String(input.employee.id || '');
      const entityBundle = buildEmployeeAdminSummaryBundle(input);

      setLoading(true);
      try {
        return await request({
          mode: 'summarize',
          prompt:
            'لخّص الحالة الإدارية للموظف: الوضع الوظيفي، الإجازات الأخيرة، الملاحظات، وأي مخاطر امتثال واضحة. استخدم نقاطاً مرقمة وعربية مهنية.',
          companyId,
          entityType: 'employee',
          entityId,
          entityBundle,
        });
      } finally {
        setLoading(false);
      }
    },
    [request, companyId]
  );

  return { summarizeEmployee, loading };
}
