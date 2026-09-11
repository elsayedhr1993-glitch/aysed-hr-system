import type { EmployeeContract } from '../context/OdooHierarchyContext';
import type { EOSCalculation } from '../types';

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

export interface KuwaitEosInput {
  employeeId: string;
  employeeName: string;
  civilId: string;
  joinDate: string;
  leaveDate: string;
  grossSalary: number;
  terminationType: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'CONTRACT_EXPIRED';
  contractType: 'INDEFINITE' | 'FIXED_TERM';
  unusedLeaveDays?: number;
  otherDeductions?: number;
  totalUnpaidLeaveDays?: number;
  unpaidLeavesBreakdown?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }>;
}

export function calculateKuwaitEOS(params: KuwaitEosInput): EOSCalculation {
  const join = new Date(params.joinDate);
  const leave = new Date(params.leaveDate);
  const grossTotalDays = Math.max(0, Math.floor((leave.getTime() - join.getTime()) / (1000 * 60 * 60 * 24)));
  const unpaidDays = Math.max(0, params.totalUnpaidLeaveDays || 0);
  const netServiceDays = Math.max(0, grossTotalDays - unpaidDays);
  const totalYearsFloat = netServiceDays / 365.25;
  const totalYears = Math.floor(totalYearsFloat);
  const totalMonths = Math.floor((totalYearsFloat - totalYears) * 12);
  const remainingDays = Math.round((((totalYearsFloat - totalYears) * 12) - totalMonths) * 30.4375);
  const dailySalary = params.grossSalary / KUWAIT_MONTHLY_DAYS;

  const first5YearsDays = Math.min(totalYearsFloat, 5) * 15;
  const after5YearsDays = Math.max(0, totalYearsFloat - 5) * KUWAIT_MONTHLY_DAYS;
  const grossEosAmount = Math.min((first5YearsDays + after5YearsDays) * dailySalary, params.grossSalary * 18);

  let article53Ratio = 1;
  let article53Note = 'استحقاق كامل بنسبة 100% (إنهاء خدمة من رب العمل / انتهاء عقد / تقاعد)';
  if (params.terminationType === 'RESIGNATION') {
    if (totalYearsFloat < 3) {
      article53Ratio = 0;
      article53Note = 'استقالة قبل 3 سنوات: 0% استحقاق وفق المادة 53';
    } else if (totalYearsFloat < 5) {
      article53Ratio = 0.5;
      article53Note = 'استقالة من 3 إلى أقل من 5 سنوات: 50% وفق المادة 53';
    } else if (totalYearsFloat < 10) {
      article53Ratio = 2 / 3;
      article53Note = 'استقالة من 5 إلى أقل من 10 سنوات: 66.66% وفق المادة 53';
    }
  }

  const netEosAmount = grossEosAmount * article53Ratio;
  const unusedLeaveDays = params.unusedLeaveDays || 0;
  const leavePayoutAmount = unusedLeaveDays * dailySalary;
  const otherDeductions = params.otherDeductions || 0;

  return {
    employeeId: params.employeeId,
    employeeName: params.employeeName,
    civilId: params.civilId,
    joinDate: params.joinDate,
    leaveDate: params.leaveDate,
    totalYears,
    totalMonths,
    totalDays: remainingDays,
    lastGrossSalary: params.grossSalary,
    terminationType: params.terminationType,
    contractType: params.contractType,
    grossServiceDays: grossTotalDays,
    totalUnpaidLeaveDays: unpaidDays,
    netServiceDays,
    unpaidLeavesCount: params.unpaidLeavesBreakdown?.length || (unpaidDays > 0 ? 1 : 0),
    unpaidLeavesBreakdown: params.unpaidLeavesBreakdown || [],
    first5YearsEntitlementDays: first5YearsDays,
    after5YearsEntitlementDays: after5YearsDays,
    grossEosAmount,
    article53Ratio,
    article53Note,
    netEosAmount,
    unusedLeaveDays,
    leavePayoutAmount,
    otherDeductions,
    totalSettlement: Math.max(0, netEosAmount + leavePayoutAmount - otherDeductions),
  };
}

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
