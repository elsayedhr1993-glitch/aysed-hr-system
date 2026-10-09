import { buildCopilotActionFromPrompt, sanitizeCopilotAction } from './aiCopilotActions';
import type { CopilotAction, CopilotActionType } from './aiCopilotTypes';

const DIRECT_LOCAL_TYPES: CopilotActionType[] = [
  'NAVIGATE',
  'OPEN_CALCULATOR',
  'TRIGGER_FUNCTION',
  'OPEN_MODAL',
];

/** Parse prompt into a validated copilot action (regex / rules), or null. */
export function resolveLocalCopilotAction(prompt: string): CopilotAction | null {
  const raw = buildCopilotActionFromPrompt(String(prompt || '').trim());
  if (!raw) return null;
  return sanitizeCopilotAction(raw);
}

export function isDirectLocalCopilotAction(action: CopilotAction | null | undefined): boolean {
  if (!action) return false;
  return DIRECT_LOCAL_TYPES.includes(action.type);
}

export function localCopilotReply(action: CopilotAction, isArabic: boolean): string {
  const title = action.title || '';
  if (isArabic) {
    return `تم التعرف على طلبك. اضغط «تنفيذ الإجراء» أدناه.\n${title}`;
  }
  return `Request recognized. Use “Run action” below.\n${title}`;
}
