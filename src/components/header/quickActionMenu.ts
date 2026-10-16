export const PAYROLL_QUICK_TOOLS = new Set(['calc_eos', 'calc_leave', 'salary_certificate']);

export function visibleQuickTools<T extends { key: string }>(items: readonly T[], payrollAllowed: boolean): T[] {
  return items.filter((item) => payrollAllowed || !PAYROLL_QUICK_TOOLS.has(item.key));
}

export function outsideClickClosesWizard(dirty: boolean): boolean {
  return !dirty;
}
