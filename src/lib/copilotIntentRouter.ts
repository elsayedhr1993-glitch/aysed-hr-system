import { buildCopilotActionFromPrompt, sanitizeCopilotAction } from './aiCopilotActions';
import type { CopilotAction } from './aiCopilotTypes';
import { resolveLocalCopilotAction, isDirectLocalCopilotAction } from './copilotLocalIntent';

export type CopilotToolId = 'tenant.employeeStats' | 'compliance.documentGaps';

export type CopilotIntentTier = 'L0' | 'L1' | 'L2' | 'L3';

export type CopilotIntent =
  | { tier: 'L0'; action: CopilotAction }
  | { tier: 'L1'; toolId: CopilotToolId }
  | { tier: 'L2'; toolId: CopilotToolId }
  | { tier: 'L3' };

function wantsEmployeeStats(text: string): boolean {
  return /(كم\s*موظف|عدد\s*الموظف|كم\s*عندي|إجمالي\s*الموظف|how\s*many\s*employees|employee\s*count|total\s*employees)/i.test(
    text
  );
}

function wantsRunningContracts(text: string): boolean {
  return /(عقود?\s*ساري|العقود?\s*الساري|عدد\s*العقود|كم\s*عقد|running\s*contracts|active\s*contracts)/i.test(
    text
  );
}

function wantsComplianceGaps(text: string): boolean {
  return (
    /(وثائق?\s*منته|انتهت\s*الإقام|انتهت\s*البطاق|ترخيص\s*منته|قريب\s*من\s*الانتهاء|نواقص|امتثال|شجرة\s*الامتثال|moh|وزارة\s*الصحة)/i.test(
      text
    ) &&
    /(من|قائمة|اعرض|كم|فحص|audit|list|show|check|gaps?)/i.test(text)
  );
}

/** Central intent classification for chat mode (shared client + server). */
export function classifyCopilotIntent(prompt: string, mode: string = 'chat'): CopilotIntent {
  const text = String(prompt || '').trim();
  if (!text || mode !== 'chat') return { tier: 'L3' };

  const localAction = resolveLocalCopilotAction(text);
  if (isDirectLocalCopilotAction(localAction)) {
    return { tier: 'L0', action: localAction! };
  }

  const legacyAction = sanitizeCopilotAction(buildCopilotActionFromPrompt(text) || undefined);
  if (legacyAction && isDirectLocalCopilotAction(legacyAction)) {
    return { tier: 'L0', action: legacyAction };
  }

  if (wantsEmployeeStats(text) || wantsRunningContracts(text)) {
    return { tier: 'L1', toolId: 'tenant.employeeStats' };
  }

  if (wantsComplianceGaps(text)) {
    return { tier: 'L2', toolId: 'compliance.documentGaps' };
  }

  return { tier: 'L3' };
}

export function isToolIntent(intent: CopilotIntent): intent is { tier: 'L1' | 'L2'; toolId: CopilotToolId } {
  return intent.tier === 'L1' || intent.tier === 'L2';
}
