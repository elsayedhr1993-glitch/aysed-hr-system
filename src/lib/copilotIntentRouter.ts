import { buildCopilotActionFromPrompt, sanitizeCopilotAction } from './aiCopilotActions';
import type { CopilotAction } from './aiCopilotTypes';
import { resolveLocalCopilotAction, isDirectLocalCopilotAction } from './copilotLocalIntent';

export type CopilotToolId = 'tenant.employeeStats' | 'compliance.documentGaps';

export type CopilotIntentTier = 'L0' | 'L1' | 'L2' | 'L3';

/** Filters extracted from natural-language compliance questions. */
export type ComplianceToolContext = {
  employeeNameHint?: string;
  departmentHint?: string;
};

export type CopilotIntent =
  | { tier: 'L0'; action: CopilotAction }
  | { tier: 'L1'; toolId: 'tenant.employeeStats' }
  | { tier: 'L2'; toolId: 'compliance.documentGaps'; toolContext: ComplianceToolContext }
  | { tier: 'L3' };

/** Semantic roots for compliance / document-gap intents (Arabic + English). */
const COMPLIANCE_SEMANTIC_ROOT =
  /(?:نواقص|ناقص|نقص|وثائق?|ملفات?|ملف|فحص|تدقيق|ثغر|تراخيص?|مزاولة|منته|انتهاء|انتهت|تجديد|صلاحي|امتثال|شجرة\s*الامتثال|بطاقة|إقام|جواز|رخصة|وزارة\s*الصحة|moh|pam|kff|baladiya|gaps?|compliance|expir|license|audit|document)/i;

export function wantsComplianceSemantic(text: string): boolean {
  return COMPLIANCE_SEMANTIC_ROOT.test(String(text || '').trim());
}

function wantsEmployeeStats(text: string): boolean {
  if (wantsComplianceSemantic(text)) return false;
  return /(كم\s*موظف|عدد\s*الموظف|كم\s*عندي|إجمالي\s*الموظف|how\s*many\s*employees|employee\s*count|total\s*employees)/i.test(
    text
  );
}

function wantsRunningContracts(text: string): boolean {
  if (wantsComplianceSemantic(text)) return false;
  return /(عقود?\s*ساري|العقود?\s*الساري|عدد\s*العقود|كم\s*عقد|running\s*contracts|active\s*contracts)/i.test(
    text
  );
}

function normalizeHint(value: string): string {
  return value
    .replace(/[؟?!.،,:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pull employee / department hints from compliance-style questions. */
export function extractComplianceToolContext(prompt: string): ComplianceToolContext {
  const text = String(prompt || '').trim();
  const ctx: ComplianceToolContext = {};

  const deptMatch =
    text.match(/(?:في\s+)?(?:قسم|إدارة|department)\s+([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,2})/i) ||
    text.match(/(?:موظفين|موظفي)\s+([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,2})/i);
  if (deptMatch?.[1]) {
    const dept = normalizeHint(deptMatch[1]);
    if (dept.length >= 2) ctx.departmentHint = dept;
  }

  const namePatterns = [
    /ملف(?:ات)?\s+(?:الموظف\s+|للموظف\s+)?([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,3})/i,
    /(?:لدى|عند)\s+(?:الموظف\s+)?([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,3})/i,
    /(?:موظف|الموظف)\s+([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,3})/i,
    /(?:اسم|اسمه|اسمها)\s+([^\s،؟?.!]+(?:\s+[^\s،؟?.!]+){0,3})/i,
    /employee\s+([a-zA-Z\u0600-\u06FF]+(?:\s+[a-zA-Z\u0600-\u06FF]+){0,3})/i,
  ];

  for (const pattern of namePatterns) {
    const m = text.match(pattern);
    if (m?.[1]) {
      let name = normalizeHint(m[1]);
      name = name.replace(/^(ال|في|من|على|عند|لدى)\s+/i, '').trim();
      const stopWords = ['الموظفين', 'الموظف', 'موظف', 'ملفات', 'ملف', 'وثائق', 'الوثائق'];
      if (stopWords.includes(name)) continue;
      if (name.length >= 2) {
        ctx.employeeNameHint = name;
        break;
      }
    }
  }

  return ctx;
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

  if (wantsComplianceSemantic(text)) {
    return {
      tier: 'L2',
      toolId: 'compliance.documentGaps',
      toolContext: extractComplianceToolContext(text),
    };
  }

  if (wantsEmployeeStats(text) || wantsRunningContracts(text)) {
    return { tier: 'L1', toolId: 'tenant.employeeStats' };
  }

  return { tier: 'L3' };
}

export function isToolIntent(
  intent: CopilotIntent
): intent is { tier: 'L1'; toolId: CopilotToolId } | { tier: 'L2'; toolId: 'compliance.documentGaps'; toolContext: ComplianceToolContext } {
  return intent.tier === 'L1' || intent.tier === 'L2';
}

export function resolveToolIdFromIntent(intent: CopilotIntent): CopilotToolId | null {
  if (intent.tier === 'L1') return intent.toolId;
  if (intent.tier === 'L2') return intent.toolId;
  return null;
}
