import type { Firestore } from 'firebase-admin/firestore';
import type { CopilotToolId } from '../../src/lib/copilotIntentRouter';
import {
  formatComplianceDocumentGapsReply,
  runComplianceDocumentGaps,
} from './tools/complianceDocumentGaps';
import {
  formatTenantEmployeeStatsReply,
  runTenantEmployeeStats,
} from './tools/tenantEmployeeStats';

export type CopilotToolRunResult = {
  toolId: CopilotToolId;
  data: unknown;
  reply: string;
};

export async function runCopilotTool(
  db: Firestore,
  toolId: CopilotToolId,
  companyId: string,
  options?: { isArabic?: boolean; companyName?: string }
): Promise<CopilotToolRunResult> {
  const isArabic = options?.isArabic !== false;

  switch (toolId) {
    case 'tenant.employeeStats': {
      const data = await runTenantEmployeeStats(db, companyId);
      return {
        toolId,
        data,
        reply: formatTenantEmployeeStatsReply(data, isArabic, options?.companyName),
      };
    }
    case 'compliance.documentGaps': {
      const data = await runComplianceDocumentGaps(db, companyId);
      return {
        toolId,
        data,
        reply: formatComplianceDocumentGapsReply(data, isArabic),
      };
    }
    default:
      throw new Error(`Unknown copilot tool: ${toolId}`);
  }
}
