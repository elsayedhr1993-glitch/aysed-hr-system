import {
  DAILY_WAGE_DIVISOR,
  KWD_DECIMALS,
  STANDARD_DAILY_HOURS,
} from '../config/kuwaitLaborConstants';

export { DAILY_WAGE_DIVISOR, KWD_DECIMALS, STANDARD_DAILY_HOURS };

/** Round KWD amounts to 3 decimal places (Kuwaiti fils). */
export function cleanKwdAmount(amount: number | undefined | null): number {
  if (amount === undefined || amount === null || isNaN(amount)) return 0;
  return Number((Math.round((amount + Number.EPSILON) * 1000) / 1000).toFixed(KWD_DECIMALS));
}

/** Daily wage = basic salary ÷ 26, rounded to 3 decimals. */
export function calculateKuwaitDailyRate(basicWage: number): number {
  if (!basicWage || basicWage <= 0) return 0;
  return cleanKwdAmount(basicWage / DAILY_WAGE_DIVISOR);
}

/** Leave cash = days × daily rate, both rounded per Kuwait payroll standard. */
export function calculateKuwaitLeaveCashAmount(days: number, basicWage: number): number {
  if (!days || days <= 0 || !basicWage || basicWage <= 0) return 0;
  return cleanKwdAmount(days * calculateKuwaitDailyRate(basicWage));
}

/** Hourly wage from daily rate ÷ standard hours. */
export function calculateKuwaitHourlyRate(
  dailyWage: number,
  dailyHours: number = STANDARD_DAILY_HOURS
): number {
  if (!dailyWage || dailyWage <= 0 || dailyHours <= 0) return 0;
  return cleanKwdAmount(dailyWage / dailyHours);
}

/** Operational payroll deductions only (no social insurance / PIFSS). */
export function sumOperationalPayrollDeductions(input: {
  absenceDeduction?: number;
  delayDeduction?: number;
  loanDeduction?: number;
  otherDeductions?: number;
}): number {
  return cleanKwdAmount(
    (input.absenceDeduction || 0) +
      (input.delayDeduction || 0) +
      (input.loanDeduction || 0) +
      (input.otherDeductions || 0)
  );
}

export function computeNetPayrollFromComponents(input: {
  grossSalary: number;
  overtimeAmount?: number;
  bonusAmount?: number;
  absenceDeduction?: number;
  delayDeduction?: number;
  loanDeduction?: number;
  otherDeductions?: number;
}): { totalDeductions: number; netSalary: number } {
  const totalDeductions = sumOperationalPayrollDeductions(input);
  const netSalary = Math.max(
    0,
    cleanKwdAmount(
      (input.grossSalary || 0) +
        (input.overtimeAmount || 0) +
        (input.bonusAmount || 0) -
        totalDeductions
    )
  );
  return { totalDeductions, netSalary };
}
