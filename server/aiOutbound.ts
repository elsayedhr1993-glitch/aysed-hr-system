import { canReadPayroll, canRevealIdentity, normalizeHrRole } from '../src/security/accessRoles';
import { maskIdentity } from '../src/security/identityMask';

const CIVIL_RE = /\b\d{12}\b/g;
const PASSPORT_RE =
  /((?:رقم\s*)?(?:الجواز|جواز(?:\s*السفر)?|passport(?:\s*(?:no\.?|number))?)[\s:：#-]*)([A-Za-z0-9]{5,12})/gi;
const SALARY_RE =
  /((?:راتب|الراتب|أجر|الأجر|بدل|salary|allowance|basicSalary|totalSalary|netSalary|housingAllowance)[^\d\n]{0,24})(\d[\d,.]*)/gi;

export type ChatSession =
  | { ok: true; uid: string; role: string; companyId: string }
  | { ok: false; status: number; code: string; error: string };

/** Identity, role, and company must come from the verified session before any query. */
export function assertChatSession(input: {
  uid?: string;
  role?: string;
  companyId?: string;
}): ChatSession {
  const uid = String(input.uid || '').trim();
  if (!uid) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      error: 'يلزم تسجيل الدخول قبل استخدام المساعد.',
    };
  }
  const role = normalizeHrRole(input.role);
  if (role === 'UNKNOWN') {
    return {
      ok: false,
      status: 403,
      code: 'ROLE_REQUIRED',
      error: 'لا توجد صلاحية مرتبطة بهذه الجلسة.',
    };
  }
  const companyId = String(input.companyId || '').trim();
  if (!companyId || companyId === 'SAAS_PLATFORM' || companyId === 'comp-super-admin') {
    return {
      ok: false,
      status: 403,
      code: 'COMPANY_MISMATCH',
      error: 'لا توجد منشأة مرتبطة بجلسة الدخول.',
    };
  }
  return { ok: true, uid, role, companyId };
}

export function clipText(value: unknown, max: number): string {
  const text = String(value ?? '').trim();
  if (text.length <= max) return text;
  return text.slice(0, max);
}

/** Drop tenant identifiers. They authorize the query and are not model input. */
export function stripTenantIdentifiers(text: string): string {
  return String(text || '')
    .split('\n')
    .filter((line) => !/معرّف الشركة|companyId\s*[:=]/i.test(line))
    .join('\n')
    .trim();
}

export function redactModelText(text: string, role: string): string {
  let out = String(text || '');
  if (!canRevealIdentity(role)) {
    out = out.replace(CIVIL_RE, (id) => maskIdentity(id, 'civil'));
    out = out.replace(PASSPORT_RE, (_all, label: string, value: string) => {
      return `${label}${maskIdentity(value, 'passport')}`;
    });
  }
  if (!canReadPayroll(role)) {
    out = out.replace(SALARY_RE, (_all, label: string) => `${label}•••`);
  }
  return out;
}

export function prepareModelText(value: unknown, role: string, max: number): string {
  return redactModelText(stripTenantIdentifiers(clipText(value, max)), role);
}

export type ModelTurn = { role?: string; content?: string };

export function buildChatModelParts(input: {
  role: string;
  prompt: string;
  contextSummary?: unknown;
  activeApp?: unknown;
  screenSummary?: unknown;
  conversationHistory?: unknown;
}): { text: string }[] {
  const role = input.role;
  const parts: { text: string }[] = [];
  const summary = prepareModelText(input.contextSummary, role, 800);
  const app = clipText(input.activeApp, 40);
  const screen = prepareModelText(input.screenSummary, role, 400);
  const brief = [
    summary ? `[ملخص]\n${summary}` : '',
    app ? `الشاشة: ${app}` : '',
    screen ? `وصف الشاشة: ${screen}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  if (brief) parts.push({ text: brief });

  if (Array.isArray(input.conversationHistory)) {
    for (const msg of input.conversationHistory.slice(-4)) {
      const turn = msg as ModelTurn;
      const who = turn.role === 'assistant' ? 'المساعد' : 'المستخدم';
      const content = prepareModelText(turn.content, role, 400);
      if (content) parts.push({ text: `${who}: ${content}` });
    }
  }
  parts.push({ text: `سؤال المستخدم: ${prepareModelText(input.prompt, role, 2000)}` });
  return parts;
}

export function buildGenerateModelText(input: {
  role: string;
  prompt: string;
  contextSummary?: unknown;
  activeApp?: unknown;
  screenSummary?: unknown;
  fieldKind?: unknown;
  fieldHint?: string;
  currentValue?: unknown;
  maxLength?: unknown;
}): string {
  const role = input.role;
  return [
    prepareModelText(input.contextSummary, role, 800),
    input.activeApp ? `الشاشة: ${clipText(input.activeApp, 40)}` : '',
    input.screenSummary ? `وصف الشاشة: ${prepareModelText(input.screenSummary, role, 400)}` : '',
    `نوع الحقل: ${clipText(input.fieldKind, 40) || 'general'}`,
    `توجيه الصياغة: ${clipText(input.fieldHint, 240)}`,
    `الحد الأقصى للأحرف: ${input.maxLength ? clipText(input.maxLength, 12) : 'غير محدد'}`,
    `النص الحالي:\n${prepareModelText(input.currentValue, role, 800) || '—'}`,
    `تعليمات المستخدم:\n${prepareModelText(input.prompt, role, 1500)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildSummarizeModelText(input: {
  role: string;
  prompt: string;
  entityType?: unknown;
  entityBundle?: unknown;
}): string {
  const role = input.role;
  const kind = clipText(input.entityType, 40) || 'entity';
  return [
    `[سجل للتلخيص — ${kind}]`,
    prepareModelText(input.entityBundle, role, 3000),
    `تعليمات التلخيص:\n${prepareModelText(input.prompt, role, 500) || 'لخّص الحالة الإدارية بشكل مهني ومختصر.'}`,
  ].join('\n');
}
