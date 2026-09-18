import { parseEmployeeCreationPrompt } from './aiEmployeeActionParser';
import {
  COPILOT_APP_IDS,
  COPILOT_FUNCTION_NAMES,
  COPILOT_MODAL_IDS,
  CopilotAction,
  CopilotActionType,
} from './aiCopilotTypes';

const ACTION_TYPES: CopilotActionType[] = [
  'NAVIGATE',
  'OPEN_MODAL',
  'TRIGGER_FUNCTION',
  'CREATE_EMPLOYEE',
  'OPEN_CALCULATOR',
];

export function buildCreateEmployeeActionFromPrompt(prompt: string): CopilotAction | null {
  const parsed = parseEmployeeCreationPrompt(prompt);
  if (!parsed) return null;

  return {
    type: 'CREATE_EMPLOYEE',
    title: 'إنشاء موظف عبر مسار التعيين',
    employeeData: {
      nameAr: parsed.nameAr,
      nameEn: parsed.nameEn || parsed.nameAr,
      civilId: parsed.civilId,
      jobTitle: parsed.jobTitle,
      department: parsed.department,
      basicSalary: parsed.basicSalary,
      phone: parsed.phone,
      nationality: parsed.nationality,
      email: parsed.email,
      iban: parsed.iban,
      bankName: parsed.bankName,
    },
  };
}

export function sanitizeCopilotAction(raw: unknown): CopilotAction | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const type = String(o.type || '').toUpperCase() as CopilotActionType;
  if (!ACTION_TYPES.includes(type)) return null;

  const title = String(o.title || '').trim() || 'إجراء من المساعد';

  if (type === 'NAVIGATE') {
    const appId = String(o.appId || '').trim();
    if (!COPILOT_APP_IDS.includes(appId as any)) return null;
    return { type, title, appId: appId as CopilotAction['appId'] };
  }

  if (type === 'OPEN_MODAL') {
    const modal = String(o.modal || '').trim();
    if (!COPILOT_MODAL_IDS.includes(modal as any)) return null;
    return { type, title, modal: modal as CopilotAction['modal'] };
  }

  if (type === 'TRIGGER_FUNCTION') {
    const functionName = String(o.functionName || o.function || '').trim();
    if (!COPILOT_FUNCTION_NAMES.includes(functionName as any)) return null;
    return { type, title, functionName: functionName as CopilotAction['functionName'] };
  }

  if (type === 'OPEN_CALCULATOR') {
    return { type, title };
  }

  if (type === 'CREATE_EMPLOYEE') {
    const ed = (o.employeeData && typeof o.employeeData === 'object' ? o.employeeData : o) as Record<
      string,
      unknown
    >;
    const nameAr = String(ed.nameAr || ed.name || '').trim();
    if (!nameAr && !ed.civilId) return null;
    return {
      type,
      title,
      employeeData: {
        nameAr: nameAr || undefined,
        nameEn: String(ed.nameEn || '').trim() || undefined,
        civilId: String(ed.civilId || ed.civil_id || '').replace(/\D/g, '') || undefined,
        jobTitle: String(ed.jobTitle || ed.job || '').trim() || undefined,
        department: String(ed.department || ed.dept || '').trim() || undefined,
        basicSalary: ed.basicSalary != null ? String(ed.basicSalary) : undefined,
        phone: String(ed.phone || '').trim() || undefined,
        nationality: String(ed.nationality || '').trim() || undefined,
        email: String(ed.email || '').trim() || undefined,
        iban: String(ed.iban || '').trim() || undefined,
        bankName: String(ed.bankName || '').trim() || undefined,
      },
    };
  }

  return null;
}

/** Parse model JSON `{ reply, action }` or legacy markdown-only. */
export function parseModelCopilotPayload(text: string): { reply: string; action: CopilotAction | null } {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      const reply = String(parsed.reply || parsed.message || '').trim();
      const action = sanitizeCopilotAction(parsed.action ?? parsed);
      if (reply) return { reply, action };
    }
  } catch {
    // not JSON — treat as plain reply
  }
  return { reply: cleaned, action: null };
}
