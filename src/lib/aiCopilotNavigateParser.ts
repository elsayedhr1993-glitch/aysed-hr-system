import type { CopilotAction, CopilotAppId } from './aiCopilotTypes';
import { COPILOT_APP_IDS } from './aiCopilotTypes';

const APP_ID_ALIASES: Record<string, CopilotAppId> = {
  timeoff: 'leaves',
  'time-off': 'leaves',
  time_off: 'leaves',
};

export function normalizeCopilotAppId(raw: string): CopilotAppId | null {
  const key = String(raw || '').trim().toLowerCase();
  if (!key) return null;
  const mapped = (APP_ID_ALIASES[key] || key) as CopilotAppId;
  return COPILOT_APP_IDS.includes(mapped) ? mapped : null;
}

function hasOpenIntent(text: string): boolean {
  return /(افتح|فتح|اذهب|انتقل|عرض|show|open|go\s+to|navigate|display)/i.test(text);
}

/** Deterministic navigation / calculator actions when the model returns text-only. */
export function buildNavigateActionFromPrompt(prompt: string): CopilotAction | null {
  const text = String(prompt || '').trim();
  if (!text) return null;

  if (hasOpenIntent(text) && /(حاسبة|calculator)/i.test(text)) {
    return {
      type: 'OPEN_CALCULATOR',
      title: 'فتح حاسبة الموارد البشرية السريعة',
    };
  }

  const wantsLeaves =
    /(إجازات|الإجازات|time\s*off|timeoff|leaves|الغياب|إجازة)/i.test(text) &&
    (hasOpenIntent(text) || /تطبيق\s*الإجازات/i.test(text));

  if (wantsLeaves) {
    const wantsFinance = /(مركز\s*مالي|المركز\s*المالي|financial\s*center|payroll\s*finance|مالي\s*للإجاز)/i.test(
      text
    );
    return {
      type: 'NAVIGATE',
      appId: 'leaves',
      title: wantsFinance ? 'فتح تطبيق الإجازات — المركز المالي' : 'فتح تطبيق الإجازات',
      ...(wantsFinance ? { appTab: 'finance' } : {}),
    };
  }

  if (
    (hasOpenIntent(text) || /(سجل|سجلات|logs|time\s*tracking|biometric)/i.test(text)) &&
    /(حضور|attendance|بصمة|دوام)/i.test(text)
  ) {
    return { type: 'NAVIGATE', appId: 'attendance', title: 'فتح تطبيق الحضور والدوام' };
  }

  if (
    (hasOpenIntent(text) || /(كشوف|كشف|reports?)/i.test(text)) &&
    /(رواتب|payroll|wps|حماية\s*الأجور|wage\s*protection)/i.test(text)
  ) {
    return { type: 'NAVIGATE', appId: 'payroll', title: 'فتح تطبيق الرواتب' };
  }

  if (hasOpenIntent(text) && /(موظفين|employees|الموظفين)/i.test(text)) {
    return { type: 'NAVIGATE', appId: 'employees', title: 'فتح تطبيق الموظفين' };
  }

  if (hasOpenIntent(text) && /(عقود|contracts)/i.test(text)) {
    return { type: 'NAVIGATE', appId: 'contracts', title: 'فتح تطبيق العقود' };
  }

  if (
    /(wps|حماية\s*الأجور|wage\s*protection)/i.test(text) &&
    /(تحميل|تصدير|export|download)/i.test(text)
  ) {
    return {
      type: 'TRIGGER_FUNCTION',
      functionName: 'export_wps',
      title: 'تصدير ملف حماية الأجور (WPS)',
    };
  }

  return null;
}
