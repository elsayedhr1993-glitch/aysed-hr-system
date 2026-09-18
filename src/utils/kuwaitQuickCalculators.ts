/** Shared Kuwait HR quick calculator math (KWD, 3 decimals). */

export const PIFSS_SALARY_CAP_KWD = 3000;
export const PIFSS_EMPLOYEE_RATE = 0.105;
export const PIFSS_EMPLOYER_RATE = 0.115;

export function roundKwd(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(3));
}

export function calculatePifssContributions(grossSalary: number) {
  const insuredSalary = Math.min(Math.max(grossSalary, 0), PIFSS_SALARY_CAP_KWD);
  const employeeShare = roundKwd(insuredSalary * PIFSS_EMPLOYEE_RATE);
  const employerShare = roundKwd(insuredSalary * PIFSS_EMPLOYER_RATE);
  const totalContribution = roundKwd(employeeShare + employerShare);
  const capped = grossSalary > PIFSS_SALARY_CAP_KWD;

  return {
    insuredSalary,
    employeeShare,
    employerShare,
    totalContribution,
    capped,
  };
}

export function calculateOvertimeTotals(input: {
  monthlySalary: number;
  divisor: number;
  hoursPerDay: number;
  dayOtHours: number;
  nightHolidayOtHours: number;
}) {
  const divisor = input.divisor > 0 ? input.divisor : 26;
  const hoursPerDay = input.hoursPerDay > 0 ? input.hoursPerDay : 8;
  const daily = input.monthlySalary / divisor;
  const hourly = daily / hoursPerDay;
  const rate125 = hourly * 1.25;
  const rate150 = hourly * 1.5;
  const dayHours = Math.max(0, input.dayOtHours);
  const nightHours = Math.max(0, input.nightHolidayOtHours);

  return {
    daily: roundKwd(daily),
    hourly: roundKwd(hourly),
    rate125: roundKwd(rate125),
    rate150: roundKwd(rate150),
    totalDayOt: roundKwd(dayHours * rate125),
    totalNightOt: roundKwd(nightHours * rate150),
    totalOt: roundKwd(dayHours * rate125 + nightHours * rate150),
  };
}

export type QuickCalculatorTab = 'eos' | 'leave' | 'wage' | 'pifss';
