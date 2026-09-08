import { EmployeeContract } from '../context/OdooHierarchyContext';

/**
 * Kuwait Payroll Engine (Article 51, 26 Days Rule)
 * 
 * In Kuwait labor law:
 * - A month is considered 26 working days for calculation of deductions and leave accruals.
 * - Daily Wage = Gross Salary / 26
 * - Hourly Wage = Daily Wage / 8
 */
export const KUWAIT_MONTHLY_DAYS = 26;
export const STANDARD_DAILY_HOURS = 8;

export function calculateDailyWage(grossSalary: number): number {
  return grossSalary / KUWAIT_MONTHLY_DAYS;
}

export function calculateHourlyWage(grossSalary: number): number {
  return calculateDailyWage(grossSalary) / STANDARD_DAILY_HOURS;
}

export interface PayrollCalculationResult {
  employeeId: string;
  grossSalary: number;
  basicSalary: number;
  allowances: number;
  unpaidAbsenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  overtimeHours: number;
  overtimeAmount: number;
  socialSecurityDeduction: number;
  netSalary: number;
}

/**
 * Calculate payroll for a single employee based on 26 days rule.
 */
export function calculateEmployeePayroll(
  employee: EmployeeContract,
  attendance: any,
  socialSecurityRate: number = 0.105 // 10.5% for Kuwaitis (employee share), 0% for Expats
): PayrollCalculationResult {
  
  const basicSalary = employee.basicSalary || 0;
  const allowances = (employee.housingAllowance || 0) + 
                     (employee.transportAllowance || 0) + 
                     (employee.medicalAllowance || 0);
  const grossSalary = basicSalary + allowances;

  const dailyWage = calculateDailyWage(grossSalary);
  const hourlyWage = calculateHourlyWage(grossSalary);

  // 1. Unpaid Absence Deduction
  const unpaidAbsenceDays = attendance?.unpaidAbsenceDays || 0;
  const absenceDeduction = unpaidAbsenceDays * dailyWage;

  // 2. Delay Deduction (Late check-ins)
  const delayMinutes = attendance?.delayMinutes || 0;
  const delayDeduction = (delayMinutes / 60) * hourlyWage;

  // 3. Overtime (1.25x for regular days according to Kuwait law)
  const overtimeHours = attendance?.overtimeHours || 0;
  const overtimeAmount = overtimeHours * hourlyWage * 1.25;

  // 4. Social Security (PIFSS)
  // Only applies to Kuwaitis (and sometimes GCC citizens, but assuming 0 for expats)
  const socialSecurityDeduction = employee.isKuwaiti ? (grossSalary * socialSecurityRate) : 0;

  // 5. Net Salary Calculation
  const netSalary = grossSalary - absenceDeduction - delayDeduction - socialSecurityDeduction + overtimeAmount;

  return {
    employeeId: employee.id,
    grossSalary,
    basicSalary,
    allowances,
    unpaidAbsenceDays,
    absenceDeduction,
    delayMinutes,
    delayDeduction,
    overtimeHours,
    overtimeAmount,
    socialSecurityDeduction,
    netSalary: Math.max(0, netSalary) // Prevents negative salary
  };
}

/**
 * Calculates Accrued Leave Days
 * In Kuwait, employee is entitled to 30 days of annual leave per 11 months of work.
 * (Accrual rate roughly 2.5 days per month)
 */
export function calculateAccruedLeave(monthsWorked: number): number {
  return monthsWorked * 2.5;
}
