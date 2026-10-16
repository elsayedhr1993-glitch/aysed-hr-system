/** Display helpers for the payroll screen. They do not call the wage formula. */

export const LAW_59_TEXT = 'لا يجوز استقطاع أكثر من 10% من أجر العامل وفاءً لما يقترضه.';
export const LAW_51_53_TEXT = '15 يوماً للسنوات الـ 5 الأولى وشهر عما تلاها';
export const LAW_66_TEXT = 'الأيام العادية طبقاً للمادة 66';
export const LAW_70_TEXT =
  'صرف البدل النقدي لرصيد الإجازات بدون إجازة وفق أحكام قانون العمل الكويتي (المادة 70)';
export const LAW_71_TEXT =
  'يُصرف للعامل أجره عن الإجازة السنوية مقدماً قبل قيامه بها، ولا يجوز النزول عن حق الإجازة أو الاستعاضة عنها ببدل مالي إلا عند انتهاء عقد العمل أو باتفاق الطرفين.';

export type PayslipLedgerFields = {
  id: string;
  payslipNumber: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusAmount?: number;
  absenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  loanDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'review' | 'confirmed' | 'paid';
  notes?: string;
  reversalOfId?: string;
  reversalReason?: string;
};

const MONEY_KEYS = [
  'basicSalary',
  'housingAllowance',
  'transportAllowance',
  'medicalAllowance',
  'overtimeAmount',
  'bonusAmount',
  'absenceDeduction',
  'delayDeduction',
  'loanDeduction',
  'grossSalary',
  'totalDeductions',
  'netSalary',
] as const;

/** A column is hidden only when every visible row is zero. */
export function columnAllZero<Row>(rows: readonly Row[], pick: (row: Row) => number): boolean {
  return rows.length > 0 && rows.every((row) => Number(pick(row)) === 0);
}

/**
 * Offsetting copy of amounts already stored on the slip.
 * Does not recompute gross, deductions, or net.
 */
export function buildPayrollReversal<T extends PayslipLedgerFields>(
  source: T,
  reason: string,
  id: string,
): T {
  const flip = (value: number | undefined) => -Number(value || 0);
  const next = { ...source, id, payslipNumber: `قيد/${source.payslipNumber}` };
  const writeFlipped = <K extends (typeof MONEY_KEYS)[number]>(key: K) => {
    next[key] = flip(source[key] as number | undefined) as T[K];
  };
  for (const key of MONEY_KEYS) writeFlipped(key);
  next.overtimeHours = flip(source.overtimeHours);
  next.absenceDays = flip(source.absenceDays);
  next.delayMinutes = flip(source.delayMinutes);
  next.status = 'confirmed';
  next.reversalOfId = source.id;
  next.reversalReason = reason.trim();
  next.notes = reason.trim();
  return next;
}

export function payslipHasReversal(
  slips: readonly { id: string; reversalOfId?: string }[],
  payslipId: string,
): boolean {
  return slips.some((slip) => slip.reversalOfId === payslipId);
}
