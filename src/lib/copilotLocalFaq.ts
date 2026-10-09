import type { Employee } from '../types';

export type CopilotEmployeeStats = {
  total: number;
  active: number;
  companyName?: string;
};

function isActiveEmployee(emp: Employee): boolean {
  const s = String(emp.status || '').toUpperCase();
  return !['TERMINATED', 'RESIGNED', 'INACTIVE', 'DELETED'].includes(s) && s !== 'منتهي';
}

export function computeCopilotEmployeeStats(
  employees: Employee[],
  companyName?: string
): CopilotEmployeeStats {
  const active = employees.filter(isActiveEmployee).length;
  return {
    total: employees.length,
    active,
    companyName,
  };
}

/** Parse stats line from buildCompanyContextSummary when only summary text is available (server). */
export function parseEmployeeStatsFromContextSummary(summary: string): CopilotEmployeeStats | null {
  const text = String(summary || '');
  const m = text.match(/الموظفون النشطون:\s*(\d+)\s*\(إجمالي السجلات:\s*(\d+)\)/);
  if (!m) return null;
  const nameMatch = text.match(/الاسم:\s*(.+)/);
  return {
    active: Number(m[1]),
    total: Number(m[2]),
    companyName: nameMatch ? nameMatch[1].trim() : undefined,
  };
}

function wantsEmployeeCount(prompt: string): boolean {
  return /(كم\s*موظف|عدد\s*الموظف|كم\s*عندي\s*موظف|how\s*many\s*employees|employee\s*count|total\s*employees)/i.test(
    prompt
  );
}

export function tryLocalFaqAnswer(
  prompt: string,
  stats: CopilotEmployeeStats | null,
  isArabic: boolean
): string | null {
  if (!stats || !wantsEmployeeCount(prompt)) return null;

  const org = stats.companyName && stats.companyName !== '—' ? stats.companyName : '';
  if (isArabic) {
    const scope = org ? ` في **${org}**` : '';
    return `لديك **${stats.active}** موظف نشط${scope} (إجمالي السجلات في الدليل: **${stats.total}**).\n\n_تم الحساب محلياً من بيانات الشركة النشطة — دون الاتصال بمحرك الذكاء الاصطناعي._`;
  }
  const scope = org ? ` at **${org}**` : '';
  return `You have **${stats.active}** active employees${scope} (**${stats.total}** records in the directory).\n\n_Calculated locally from tenant data — no AI engine call._`;
}
