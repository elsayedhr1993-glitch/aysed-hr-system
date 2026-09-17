// src/services/leaveSettlementService.ts
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { getDoc } from 'firebase/firestore';
import { 
  UniversalSettlementItem, 
  UniversalSettlementInput, 
  UniversalSettlementResult, 
  LeaveSettlementVoucher,
  HrLeaveAllocation,
  Employee,
  LeaveRequest
} from '../types';
import { computeAccrual2026Unified } from '../utils/leaveAccrual2026';
import {
  calculateKuwaitDailyRate,
  calculateKuwaitHourlyRate,
  cleanKwdAmount,
} from '../utils/kuwaitPayrollMath';
import { approveLeaveRequest } from './leaveApprovalService';
import { upsertLeaveSettlementToSupabase } from './leaveSupabaseSync';

export {
  calculateKuwaitDailyRate,
  calculateKuwaitHourlyRate,
  cleanKwdAmount,
} from '../utils/kuwaitPayrollMath';

export type {
  UniversalSettlementItem,
  UniversalSettlementInput,
  UniversalSettlementResult,
  LeaveSettlementVoucher,
};

export interface LeaveRequestInput {
  employeeId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  carriedOverBalance: number; // e.g. 44
  currentYearAccrued?: number; // e.g. 20
  joinDate?: string;  // YYYY-MM-DD
  monthlyWage?: number;
  dailyWage?: number;
  asOfDate?: Date;
}

export interface LeaveSettlementResult {
  totalCalendarDays: number;
  excludedFridays: number;
  actualLeaveDays: number; // working days
  totalAvailableBalance: number;
  paidDays: number;
  unpaidDays: number;
  remainingBalance: number;
  dailyRate: number;
  netPayableAmount: number;
  unpaidDeductionAmount: number;
  settlementSummary: {
    title: string;
    value: string;
    note: string;
  }[];
}

export interface LeaveValidationParams {
  employeeId: string;
  leaveId: string;
  requestedDays: number;
  leaveTypeId?: string;
}

export interface LeaveValidationResponse {
  status: 'success' | 'error';
  message: string;
  paidDays: number;
  unpaidDays: number;
  deductionSentToPayroll: boolean;
}

export interface AysedSettlementOutput {
  aysed_carried_over: number;
  aysed_opening_balance: number;
  aysed_accrued_2026: number;
  aysed_total_available: number;
  aysed_unpaid_days: number;
  aysed_paid_days: number;
  aysed_daily_wage: number;
  aysed_leave_cash: number;
  aysed_ticket_allowance: number;
  aysed_allowances: number;
  aysed_deductions: number;
  aysed_net_payable: number;
}

export interface AysedLeaveEngineInput {
  carriedOver: number;
  openingBalance?: number;
  accrued: number;
  requestedDays: number;
  monthlyWage: number;
  ticketAllowance?: number;
  allowances?: number;
  deductions?: number;
}

/**
 * تنسيق وتنظيف عدد الأيام بدقة رقمين عشريين لمنع تشوهات الفاصلة العائمة (Clean Floating Points)
 */
export function cleanDayDecimals(days: number | undefined | null): number {
  if (days === undefined || days === null || isNaN(days)) return 0;
  return Number((Math.round((days + Number.EPSILON) * 100) / 100).toFixed(2));
}

export function formatDayDisplay(days: number | undefined | null): string {
  const cleaned = cleanDayDecimals(days);
  return cleaned.toString();
}

export function resolveNetAvailableLeaveBalance(input: {
  totalBalance?: number;
  totalAvailableBalance?: number;
  approvedLeaveDeductionDays?: number;
  usedLeaveDays?: number;
  remainingBalanceAfter?: number;
  netAvailable?: number;
} = {}): number {
  const grossTotal = Number(input.totalBalance ?? input.totalAvailableBalance ?? 0) || 0;
  const approvedLeaveDays = Number(input.approvedLeaveDeductionDays ?? input.usedLeaveDays ?? 0) || 0;
  const engineNet = Number(input.netAvailable ?? NaN);
  const remainingAfter = Number(input.remainingBalanceAfter ?? NaN);

  if (approvedLeaveDays > 0) {
    return cleanDayDecimals(Math.max(0, grossTotal - approvedLeaveDays));
  }

  if (!Number.isNaN(engineNet) && engineNet >= 0) {
    return cleanDayDecimals(engineNet);
  }

  if (!Number.isNaN(remainingAfter) && remainingAfter >= 0) {
    return cleanDayDecimals(remainingAfter);
  }

  return cleanDayDecimals(Math.max(0, grossTotal));
}

/**
 * 1. حساب أيام الإجازة الفعلية باستبعاد أيام الجمعة (المادة 70 - قانون العمل الكويتي)
 */
export function calculateWorkingLeaveDays(startDateStr: string, endDateStr: string): { totalDays: number; fridaysCount: number; workingDays: number } {
  if (!startDateStr || !endDateStr) {
    return { totalDays: 0, fridaysCount: 0, workingDays: 0 };
  }
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return { totalDays: 0, fridaysCount: 0, workingDays: 0 };
  }

  let totalDays = 0;
  let fridaysCount = 0;
  
  const current = new Date(start);
  while (current <= end) {
    totalDays++;
    if (current.getDay() === 5) { // 5 = الجمعة
      fridaysCount++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  const workingDays = cleanDayDecimals(Math.max(0, totalDays - fridaysCount));

  return {
    totalDays,
    fridaysCount,
    workingDays
  };
}

/**
 * 2. احتساب الاستحقاق التراكمي لسنة 2026 (2.5 يوم/شهر — نسخة موحدة)
 */
export function computeAccrual2026(joinDateStr: string, asOfDate: Date = new Date()): number {
  return computeAccrual2026Unified(joinDateStr, asOfDate);
}

/**
 * 5. حساب أيام العمل الفعلية في الشهر حتى تاريخ السفر (باستبعاد أيام الجمعة والعطل)
 * يضمن احتساب راتب الأيام الفعلية السابقة لتاريخ المغادرة بدون أي تداخل أو تكرار
 */
export function calculatePhysicalWorkedDays(
  departureDateStr?: string, 
  monthStartDateStr?: string
): { workingDays: number; calendarDays: number; fridaysCount: number } {
  if (!departureDateStr) {
    return { workingDays: 0, calendarDays: 0, fridaysCount: 0 };
  }
  const departureDate = new Date(departureDateStr);
  if (isNaN(departureDate.getTime())) {
    return { workingDays: 0, calendarDays: 0, fridaysCount: 0 };
  }

  // بداية شهر السفر
  const monthStart = monthStartDateStr 
    ? new Date(monthStartDateStr) 
    : new Date(departureDate.getFullYear(), departureDate.getMonth(), 1);

  if (monthStart > departureDate) {
    return { workingDays: 0, calendarDays: 0, fridaysCount: 0 };
  }

  let calendarDays = 0;
  let fridaysCount = 0;
  
  // احتساب الأيام الفعلية من بداية الشهر وحتى اليوم السابق للسفر
  const current = new Date(monthStart);
  while (current < departureDate) {
    calendarDays++;
    if (current.getDay() === 5) { // 5 = الجمعة (عطلة أسبوعية رسمية)
      fridaysCount++;
    }
    current.setDate(current.getDate() + 1);
  }

  const workingDays = Math.min(26, Math.max(0, calendarDays - fridaysCount));

  return {
    workingDays,
    calendarDays,
    fridaysCount,
  };
}

/**
 * 6. محرك تسوية واحتساب الإجازة الموحد (Odoo & Kuwait Labor Law)
 */
export function processLeaveSettlement(input: LeaveRequestInput): LeaveSettlementResult {
  const asOfDate = input.asOfDate || new Date();
  const { totalDays, fridaysCount, workingDays } = calculateWorkingLeaveDays(input.startDate, input.endDate);

  const carriedOver = cleanDayDecimals(input.carriedOverBalance || 0);
  const currentAccrued = cleanDayDecimals(
    input.currentYearAccrued !== undefined 
      ? input.currentYearAccrued 
      : computeAccrual2026(input.joinDate || '2026-01-01', asOfDate)
  );

  const totalAvailableBalance = cleanDayDecimals(carriedOver + currentAccrued);

  const paidDays = cleanDayDecimals(Math.min(totalAvailableBalance, workingDays));
  const unpaidDays = cleanDayDecimals(Math.max(0, workingDays - totalAvailableBalance));
  const remainingBalance = cleanDayDecimals(Math.max(0, totalAvailableBalance - paidDays));

  const wage = input.monthlyWage || (input.dailyWage ? input.dailyWage * 26 : 0);
  const dailyRate = input.dailyWage > 0 ? cleanKwdAmount(input.dailyWage) : calculateKuwaitDailyRate(wage);
  const netPayableAmount = cleanKwdAmount(paidDays * dailyRate);
  const unpaidDeductionAmount = 0; // الخصم المالي المباشر من الراتب هو 0 د.ك بناءً على قانون المنشأة المعتمد

  const settlementSummary = [
    {
      title: "إجمالي مدة الإجازة المعتمدة",
      value: `${workingDays.toFixed(2)} يوم`,
      note: `(تم استبعاد ${fridaysCount} أيام جمعة استناداً للمادة 70)`
    },
    {
      title: "أيام مدفوعة الأجر (خصم من الرصيد)",
      value: `${paidDays.toFixed(2)} يوم`,
      note: `(${carriedOver.toFixed(2)} مرحل + ${currentAccrued.toFixed(2)} رصيد السنة)`
    },
    {
      title: "أيام غير مدفوعة (تُخصم من مدة الخدمة)",
      value: `${unpaidDays.toFixed(2)} يوم`,
      note: unpaidDays > 0 ? "تُخصم تلقائياً من مدة الخدمة الفعلية وليس من الراتب" : "لا يوجد تجاوز"
    },
    {
      title: "الرصيد المتبقي للموظف بعد التصفية",
      value: `${remainingBalance.toFixed(2)} يوم`,
      note: remainingBalance === 0 ? "تمت تصفية الرصيد بالكامل" : "رصيد متبقي متاح"
    }
  ];

  return {
    totalCalendarDays: totalDays,
    excludedFridays: fridaysCount,
    actualLeaveDays: workingDays,
    totalAvailableBalance,
    paidDays,
    unpaidDays,
    remainingBalance,
    dailyRate,
    netPayableAmount,
    unpaidDeductionAmount,
    settlementSummary
  };
}

/**
 * 7. محرك التسوية الشامل المتعدد البنود وتصفية الإجازات (Universal Multi-Item Leave Settlement & Encashment Engine)
 * يضمن منع الازدواجية وتكرار البنود (Elimination of Duplicate Earning Lines):
 * 1. احتساب راتب الأيام الفعلية السابقة للسفر بدقة بدون تكرار
 * 2. دمج وتوحيد بند التسييل النقدي للرصيد في بند موحد غير مجزأ (Unified Consolidated Encashment Line)
 * 3. معادلة صافي المستحقات المعيارية الشاملة
 * 4. تطبيق معيار قسمة 26 يوماً الإلزامي القانوني وتطهير الفواصل العشرية
 */
export function calculateUniversalLeaveSettlement(input: UniversalSettlementInput): UniversalSettlementResult {
  const mode = input.settlementMode || (input.includeEncashment && input.consumedLeaveDays === 0 ? 'ENCASHMENT_LIQUIDATION' : 'LEAVE_WITH_TRAVEL');

  const baseSalary = input.basicSalary > 0 ? input.basicSalary : input.grossSalary;
  // Unified 26-Day Divisor Standard: Daily Rate = Total Salary / 26
  const dailyWage = input.dailyWage > 0 ? cleanKwdAmount(input.dailyWage) : calculateKuwaitDailyRate(baseSalary);
  const hourlyWage = input.hourlyWage > 0 ? cleanKwdAmount(input.hourlyWage) : calculateKuwaitHourlyRate(dailyWage, 8);

  const carriedOver = cleanDayDecimals(input.carriedOverBalance || 0);
  const accrued = cleanDayDecimals(input.accruedBalance || 0);
  const totalAvailableBefore = cleanDayDecimals(carriedOver + accrued);

  // Strict FIFO consumption order: carried-over balance first, then current year accrual, then compensatory balance.
  const buckets = [
    { key: 'carriedOver', available: carriedOver },
    { key: 'accrued', available: accrued },
  ] as const;

  // Statutory Days (e.g. Bereavement Art. 77 - 3 days paid, 0 deducted from annual balance)
  const statutoryDays = cleanDayDecimals(Math.max(0, input.statutoryLeaveDays));

  const approvedConsumedDays = cleanDayDecimals(Math.max(0, input.consumedLeaveDays));
  let consumedDays = approvedConsumedDays;
  let encashedDays = 0;
  let balanceAfterConsumption = totalAvailableBefore;

  if (mode === 'ENCASHMENT_LIQUIDATION') {
    const netEncashableBalance = cleanDayDecimals(Math.max(0, totalAvailableBefore - approvedConsumedDays));
    const targetEncash = cleanDayDecimals(
      input.encashmentDays > 0 ? input.encashmentDays : netEncashableBalance
    );
    encashedDays = cleanDayDecimals(Math.min(Math.max(0, targetEncash), netEncashableBalance));
    consumedDays = approvedConsumedDays;
    balanceAfterConsumption = cleanDayDecimals(Math.max(0, totalAvailableBefore - approvedConsumedDays - encashedDays));
  } else {
    // وضع تسوية الإجازة الفعلية مع السفر:
    // 1. أيام الإجازة السنوية الفعلية المصروفة مقدماً من الطلب
    consumedDays = Math.min(approvedConsumedDays, totalAvailableBefore);
    balanceAfterConsumption = cleanDayDecimals(Math.max(0, totalAvailableBefore - consumedDays));

    // 2. أيام التسييل الإضافية غير المتداخلة إن وجدت
    if (input.includeEncashment && input.encashmentDays > 0) {
      const remainingForEncashment = cleanDayDecimals(Math.max(0, totalAvailableBefore - consumedDays));
      encashedDays = cleanDayDecimals(Math.min(Math.max(0, input.encashmentDays), remainingForEncashment));
    }
  }

  const remainingBalanceAfter = cleanDayDecimals(
    Math.max(0, totalAvailableBefore - (consumedDays + encashedDays))
  );
  const unpaidDays = cleanDayDecimals(Math.max(0, input.unpaidLeaveDays));

  // Explicit FIFO allocation plan used for settlement UI validation and approval gating.
  const fifoPlan = buckets.reduce((plan, bucket) => {
    const remainingNeeded = Math.max(0, Math.min(plan.remaining, bucket.available));
    plan.remaining -= remainingNeeded;
    plan.usedByBucket[bucket.key] = remainingNeeded;
    return plan;
  }, { remaining: Math.max(0, consumedDays + encashedDays), usedByBucket: { carriedOver: 0, accrued: 0 } as Record<string, number> });

  if (fifoPlan.remaining > 0.001) {
    const overflow = cleanDayDecimals(fifoPlan.remaining);
    throw new Error(`FIFO settlement cap exceeded: remaining demand ${overflow} days exceeds net available balance.`);
  }

  // Build Dynamic Line Items
  const items: UniversalSettlementItem[] = [];

  // 1. Dynamic Base Salary Proration (راتب أيام العمل الفعلية قبل السفر)
  // يُحسب الراتب حصرياً عن أيام العمل الفعلية السابقة لتاريخ المغادرة بقسمة 26 يوم الثابتة قانونياً (الراتب الأساسي ÷ 26 × أيام العمل الفعلية)
  if (input.includeProratedSalary && input.workedDaysInMonth > 0) {
    const workedDays = cleanDayDecimals(input.workedDaysInMonth);
    const divisor = 26; // Statutory Kuwait Standard (Article 70) - 26 working days fixed
    const proratedDailyRate = dailyWage;
    const proratedAmount = cleanKwdAmount(workedDays * proratedDailyRate);
    items.push({
      id: 'item-prorated-salary',
      category: 'SALARY_PRORATED',
      name: `راتب أيام العمل الفعلية قبل السفر (${workedDays.toFixed(2)} يوم عمل - أساس 26 يوم القانوني)`,
      type: 'EARNING',
      quantity: workedDays,
      unit: 'days',
      rate: proratedDailyRate,
      amount: proratedAmount,
      notes: `احتساب الراتب المستحق حتى تاريخ السفر (${baseSalary.toFixed(3)} د.ك ÷ 26 × ${workedDays.toFixed(2)} يوم)`,
      isEditable: true,
    });
  }

  // 2. Approved Overtime (بدل العمل الإضافي المعتمد)
  if (input.includeOvertime && input.overtimeHours > 0) {
    const overtimeHours = cleanDayDecimals(input.overtimeHours);
    const multiplier = input.overtimeMultiplier || 1.25;
    const overtimeRate = cleanKwdAmount(hourlyWage * multiplier);
    const overtimeAmount = cleanKwdAmount(overtimeHours * overtimeRate);
    items.push({
      id: 'item-overtime',
      category: 'OVERTIME',
      name: `بدل العمل الإضافي المعتمد (${overtimeHours.toFixed(2)} ساعة × ${multiplier} أجر الساعة)`,
      type: 'EARNING',
      quantity: overtimeHours,
      unit: 'hours',
      rate: overtimeRate,
      amount: overtimeAmount,
      notes: `أجر الساعة الأساسي: ${hourlyWage.toFixed(3)} د.ك × مضاعف ${multiplier}`,
      isEditable: true,
    });
  }

  // 3. Statutory Paid Leave (إجازات رسمية نظامية مدفوعة الأجر - المادة 77)
  // ملاحظة قانونية حاسمة: الإجازات الرسمية تمنح إعفاءً من الخصم من الرصيد السنوي، 
  // ولا تولد بند إضافة نقدية منفصلة منعاً للازدواجية طالما أن الراتب الأساسي/النسبي محسوب،
  // وبالتالي تظهر كبند إيضاحي بأجر إضافي = 0.000 د.ك افتراضياً.
  if (statutoryDays > 0) {
    items.push({
      id: 'item-statutory-leave',
      category: 'STATUTORY_ALLOWANCE',
      name: `إجازة عزاء / وفاة رسمية - المادة 77 (${statutoryDays.toFixed(2)} أيام مدفوعة الأجر)`,
      type: 'EARNING',
      quantity: statutoryDays,
      unit: 'days',
      rate: 0,
      amount: 0,
      notes: `حق قانوني مدفوع مشمول بالراتب (معفى من الخصم من الرصيد السنوي - إضافة نقدية إضافية: 0.000 د.ك منعاً للازدواجية)`,
      isStatutoryNonDeductible: true,
      isEditable: true,
    });
  }

  // 4. Unified Balance Encashment (Single Non-Fragmented Line) or Consumed Days
  if (mode === 'ENCASHMENT_LIQUIDATION' && encashedDays > 0) {
    // بند موحد غير مجزأ لتصفية وتسييل الرصيد
    const encashmentAmount = cleanKwdAmount(encashedDays * dailyWage);
    items.push({
      id: 'item-leave-encashment',
      category: 'LEAVE_ENCASHMENT',
      name: `بدل رصيد الإجازات السنوية المستحقة / Leave Balance Cash-out (${encashedDays.toFixed(2)} يوم)`,
      type: 'EARNING',
      quantity: encashedDays,
      unit: 'days',
      rate: dailyWage,
      amount: encashmentAmount,
      notes: `تسييل نقدي موحد ومباشر للرصيد وتحديث الرصيد الفعلي للموظف وفق المادة 70 (${encashedDays.toFixed(2)} يوم × ${dailyWage.toFixed(3)} د.ك)`,
      isEncashment: true,
      isEditable: true,
    });
  } else {
    // بدل رصيد الإجازات السنوية المصروفة مقدماً (أيام الإجازة الفعلية المطلوبة في الحركة بعد استبعاد الجمع)
    if (consumedDays > 0) {
      const leaveCashAmount = cleanKwdAmount(consumedDays * dailyWage);
      items.push({
        id: 'item-consumed-leave',
        category: 'CONSUMED_LEAVE',
        name: `بدل رصيد الإجازات السنوية المصروفة مقدماً / Paid Leave Days (${consumedDays.toFixed(2)} يوم)`,
        type: 'EARNING',
        quantity: consumedDays,
        unit: 'days',
        rate: dailyWage,
        amount: leaveCashAmount,
        notes: `أيام الإجازة الفعلية المطلوبة (${consumedDays.toFixed(2)} يوم) × ${dailyWage.toFixed(3)} د.ك (الراتب الأساسي ÷ 26)`,
        isEditable: true,
      });
    }

    // بدل تسييل رصيد إضافي متبقي إن تم تفعيله
    if (input.includeEncashment && encashedDays > 0) {
      const encashmentAmount = cleanKwdAmount(encashedDays * dailyWage);
      items.push({
        id: 'item-leave-encashment',
        category: 'LEAVE_ENCASHMENT',
        name: `بدل رصيد الإجازات السنوية المستحقة / Leave Balance Cash-out (${encashedDays.toFixed(2)} يوم)`,
        type: 'EARNING',
        quantity: encashedDays,
        unit: 'days',
        rate: dailyWage,
        amount: encashmentAmount,
        notes: `تصفية نقدية للرصيد المتبقي بعد استهلاك الإجازة (${encashedDays.toFixed(2)} يوم × ${dailyWage.toFixed(3)} د.ك)`,
        isEncashment: true,
        isEditable: true,
      });
    }
  }

  // 5. Annual Ticket Allowance (بدل تذاكر السفر)
  if (input.ticketAllowance && input.ticketAllowance > 0) {
    items.push({
      id: 'item-ticket-allowance',
      category: 'TICKET_ALLOWANCE',
      name: `بدل تذاكر السفر السنوية المعتمدة`,
      type: 'EARNING',
      quantity: 1,
      unit: 'tickets',
      rate: cleanKwdAmount(input.ticketAllowance),
      amount: cleanKwdAmount(input.ticketAllowance),
      notes: `مخصص تذاكر السفر للإجازة السنوية`,
      isEditable: true,
    });
  }

  // 6. Housing Allowance (بدل سكن مستحق إضافي)
  if (input.housingAllowance && input.housingAllowance > 0) {
    items.push({
      id: 'item-housing-allowance',
      category: 'HOUSING_ALLOWANCE',
      name: `بدل السكن المستحق`,
      type: 'EARNING',
      quantity: 1,
      unit: 'fixed',
      rate: cleanKwdAmount(input.housingAllowance),
      amount: cleanKwdAmount(input.housingAllowance),
      notes: `بدل السكن الخاص بفترة التسوية`,
      isEditable: true,
    });
  }

  // 7. Custom Earning Items
  (input.customItems || []).filter(item => item.type === 'EARNING').forEach(ci => {
    items.push({
      ...ci,
      quantity: cleanDayDecimals(ci.quantity),
      rate: cleanKwdAmount(ci.rate),
      amount: cleanKwdAmount(ci.amount),
    });
  });

  // 8. Loan Deduction (أقساط سلف وقروض)
  if (input.loanDeduction && input.loanDeduction > 0) {
    items.push({
      id: 'item-loan-deduction',
      category: 'LOAN_DEDUCTION',
      name: `سداد قسط سلفة / قرض معتمد`,
      type: 'DEDUCTION',
      quantity: 1,
      unit: 'fixed',
      rate: cleanKwdAmount(input.loanDeduction),
      amount: cleanKwdAmount(input.loanDeduction),
      notes: `خصم من مستحقات التصفية لتسوية السلفة`,
      isEditable: true,
    });
  }

  // 9. Salary Advance Deduction (استقطاع سلفة راتب)
  if (input.salaryAdvanceDeduction && input.salaryAdvanceDeduction > 0) {
    items.push({
      id: 'item-salary-advance',
      category: 'SALARY_ADVANCE',
      name: `استقطاع سلفة راتب مقدمة`,
      type: 'DEDUCTION',
      quantity: 1,
      unit: 'fixed',
      rate: cleanKwdAmount(input.salaryAdvanceDeduction),
      amount: cleanKwdAmount(input.salaryAdvanceDeduction),
      notes: `تسوية سلفة الراتب المستلمة مسبقاً`,
      isEditable: true,
    });
  }

  // 10. Admin Deduction (استقطاعات إدارية وجزاءات)
  if (input.adminDeduction && input.adminDeduction > 0) {
    items.push({
      id: 'item-admin-deduction',
      category: 'ADMIN_DEDUCTION',
      name: `استقطاعات إدارية وجزاءات مسجلة`,
      type: 'DEDUCTION',
      quantity: 1,
      unit: 'fixed',
      rate: cleanKwdAmount(input.adminDeduction),
      amount: cleanKwdAmount(input.adminDeduction),
      notes: `خصومات إدارية معتمدة من الموارد البشرية`,
      isEditable: true,
    });
  }

  // 11. Custom Deduction Items
  (input.customItems || []).filter(item => item.type === 'DEDUCTION').forEach(ci => {
    items.push({
      ...ci,
      quantity: cleanDayDecimals(ci.quantity),
      rate: cleanKwdAmount(ci.rate),
      amount: cleanKwdAmount(ci.amount),
    });
  });

  // Standardized Net Calculation Formula:
  // Net Payable = (Prorated Worked Days Salary + Approved Overtime Earnings + Consolidated Leave Encashment / Consumed Leave + Statutory Allowances + Other Approved Allowances) - Total Approved Deductions
  const totalEarnings = cleanKwdAmount(
    items
      .filter(i => i.type === 'EARNING')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );

  const totalDeductions = cleanKwdAmount(
    items
      .filter(i => i.type === 'DEDUCTION')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );

  const netSettlementPayout = cleanKwdAmount(Math.max(0, totalEarnings - totalDeductions));

  const voucherNumber = input.voucherNumber || `LST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Legacy mappings
  const aysed_leave_cash = cleanKwdAmount(
    (mode === 'ENCASHMENT_LIQUIDATION' ? encashedDays : consumedDays + encashedDays) * dailyWage
  );
  const aysed_allowances = cleanKwdAmount(totalEarnings - aysed_leave_cash - (input.ticketAllowance || 0));

  return {
    voucherNumber,
    settlementDate: input.settlementDate || new Date().toISOString().split('T')[0],
    settlementMode: mode,
    dailyWage,
    hourlyWage,
    
    carriedOverBalance: carriedOver,
    accruedBalance: accrued,
    totalAvailableBefore,
    statutoryLeaveDays: statutoryDays,
    consumedLeaveDays: consumedDays,
    encashedLeaveDays: encashedDays,
    unpaidLeaveDays: unpaidDays,
    remainingBalanceAfter,
    
    items,
    totalEarnings,
    totalDeductions,
    netSettlementPayout,
    
    // Legacy mapping for 100% backward compatibility
    aysed_carried_over: carriedOver,
    aysed_opening_balance: 0,
    aysed_accrued_2026: accrued,
    aysed_total_available: totalAvailableBefore,
    aysed_paid_days: mode === 'ENCASHMENT_LIQUIDATION' ? encashedDays : consumedDays,
    aysed_unpaid_days: unpaidDays,
    aysed_daily_wage: dailyWage,
    aysed_leave_cash,
    aysed_ticket_allowance: cleanKwdAmount(input.ticketAllowance || 0),
    aysed_allowances,
    aysed_deductions: totalDeductions,
    aysed_net_payable: netSettlementPayout,
  };
}

/**
 * 8. حسابات تسوية متوافقة مع واجهة LeaveClearanceDocument (Legacy bridge)
 */
export function calculateAysedLeaveSettlement(input: AysedLeaveEngineInput): AysedSettlementOutput {
  const carriedOver = input.carriedOver || 0;
  const accrued = input.accrued !== undefined ? input.accrued : computeAccrual2026('2026-01-01');
  const totalAvailable = Number((carriedOver + accrued).toFixed(2));

  const paidDays = Math.min(totalAvailable, input.requestedDays);
  const unpaidDays = Math.max(0, input.requestedDays - totalAvailable);

  const dailyWage = calculateKuwaitDailyRate(input.monthlyWage);
  const leaveCash = cleanKwdAmount(paidDays * dailyWage);
  const ticket = input.ticketAllowance || 0;
  const allowances = input.allowances || 0;
  const deductions = input.deductions || 0;

  const netPayable = cleanKwdAmount(Math.max(0, leaveCash + ticket + allowances - deductions));

  return {
    aysed_carried_over: carriedOver,
    aysed_opening_balance: input.openingBalance || 0,
    aysed_accrued_2026: accrued,
    aysed_total_available: totalAvailable,
    aysed_unpaid_days: Number(unpaidDays.toFixed(2)),
    aysed_paid_days: Number(paidDays.toFixed(2)),
    aysed_daily_wage: dailyWage,
    aysed_leave_cash: leaveCash,
    aysed_ticket_allowance: ticket,
    aysed_allowances: allowances,
    aysed_deductions: deductions,
    aysed_net_payable: netPayable,
  };
}

/**
 * 🔒 Odoo-style Mathematical Integrity & Constraint Validation Engine
 * @api.constrains('carriedOverBalance', 'accruedBalance', 'consumedLeaveDays', 'remainingBalanceAfter')
 */
export interface SettlementValidationResult {
  isValid: boolean;
  canApprove: boolean;
  canPrint: boolean;
  errors: string[];
  warnings: string[];
  computedFields: {
    totalAvailable: number;
    paidLeaveDays: number;
    encashedDays: number;
    dailyWage: number;
    expectedRemaining: number;
    expectedLeavePayAmount: number;
  };
}

export function validateSettlementConstraints(voucherOrInput: any): SettlementValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. استخراج الأرصدة (Variable Binding)
  const carriedOver = cleanDayDecimals(
    voucherOrInput.carriedOverBalance ?? 
    voucherOrInput.carriedOverDays ?? 
    voucherOrInput.aysed_carried_over ?? 
    voucherOrInput.openingBalance ?? 
    0
  );
  const accrued = cleanDayDecimals(
    voucherOrInput.accruedBalance ?? 
    voucherOrInput.accrued2026Days ?? 
    voucherOrInput.accruedDays ?? 
    voucherOrInput.aysed_accrued_2026 ?? 
    0
  );
  const totalAvailable = cleanDayDecimals(
    (carriedOver + accrued) > 0
      ? (carriedOver + accrued)
      : (voucherOrInput.totalAvailableBalance ?? 
         voucherOrInput.totalBalanceBefore ?? 
         voucherOrInput.totalAvailableBefore ?? 
         voucherOrInput.aysed_total_available ?? 
         0)
  );

  // 2. ربط متغير أيام الإجازة المصروفة مقدماً (Paid Leave Days)
  // يستقبل افتراضياً قيمة (أيام الإجازة المطلوبة والمعتمدة في الطلب)، وليس قيمة الرصيد الصافي المتبقي
  const paidLeaveDays = cleanDayDecimals(
    voucherOrInput.consumedLeaveDays ?? 
    voucherOrInput.paidLeaveDays ?? 
    voucherOrInput.requestedLeaveDays ?? 
    voucherOrInput.daysToEncash ?? 
    voucherOrInput.aysed_paid_days ?? 
    0
  );
  const encashedDays = cleanDayDecimals(
    voucherOrInput.encashedLeaveDays ?? 
    voucherOrInput.encashmentDays ?? 
    0
  );
  const totalDeductedDays = cleanDayDecimals(paidLeaveDays + encashedDays);

  // 3. معادلة التحقق البرمجي (Validation Rule):
  // الرصيد المتبقي = (الرصيد المرحل + الرصيد المكتسب) - أيام الإجازة المصروفة مقدماً
  const expectedRemaining = cleanDayDecimals(totalAvailable - totalDeductedDays);
  
  const recordedRemaining = cleanDayDecimals(
    voucherOrInput.remainingBalanceAfter ?? 
    voucherOrInput.balanceAfter ?? 
    expectedRemaining
  );

  const exceedsAvailableBalance = totalDeductedDays > totalAvailable + 0.001;
  const encashmentExceedsBalance = encashedDays > totalAvailable + 0.001;

  const basicSalary = Number(voucherOrInput.basicSalary ?? voucherOrInput.salary ?? 0);
  const dailyWage = basicSalary > 0 
    ? cleanKwdAmount(basicSalary / 26)
    : cleanKwdAmount(voucherOrInput.dailyWage ?? voucherOrInput.aysed_daily_wage ?? 0);
  const expectedLeavePayAmount = cleanKwdAmount(totalDeductedDays * dailyWage);

  // 4. سلوك الحارس البرمجي:
  // أ. الحماية من الرصيد السالب (Negative Balance Protection)
  if (exceedsAvailableBalance) {
    const excess = cleanDayDecimals(totalDeductedDays - totalAvailable);
    errors.push(
      `تجاوز الرصيد المتاح: أيام الإجازة والتسييل المصروفة (${totalDeductedDays} يوم) تتجاوز إجمالي الرصيد المتاح (${totalAvailable} يوم) بمقدار ${excess} يوم.`
    );
  }

  if (encashmentExceedsBalance) {
    const excess = cleanDayDecimals(encashedDays - totalAvailable);
    errors.push(
      `تجاوز رصيد التسييل النقدي: أيام التسييل (${encashedDays} يوم) تتجاوز الرصيد المتاح (${totalAvailable} يوم) بمقدار ${excess} يوم.`
    );
  }

  // ب. التحقق الرياضي الصارم (Mathematical Integrity Check)
  // المعادلة: الرصيد المتبقي = (الرصيد المرحل + الرصيد المكتسب) - أيام الإجازة المصروفة مقدماً
  if (Math.abs(recordedRemaining - expectedRemaining) > 0.05) {
    errors.push(
      `خطأ التحقق الرياضي (Mathematical Integrity Failure): الرصيد المتبقي المسجل (${recordedRemaining} يوم) لا يطابق المعادلة: (المرحل ${carriedOver} + المكتسب ${accrued}) - المصرف ${totalDeductedDays} = ${expectedRemaining} يوم.`
    );
  }

  // ج. التحقق من أجر اليوم بقاعدة الراتب الأساسي ÷ 26 (تحذير إرشادي لا يمنع الحفظ)
  if (basicSalary > 0 && voucherOrInput.dailyWage) {
    const recordedDailyWage = cleanKwdAmount(Number(voucherOrInput.dailyWage));
    if (Math.abs(recordedDailyWage - dailyWage) > 0.01) {
      warnings.push(
        `تنبيه تدقيق الأجر اليومي: أجر اليوم المسجل (${recordedDailyWage} د.ك) يختلف عن قاعدة (الراتب الأساسي ${basicSalary} ÷ 26 = ${dailyWage} د.ك). تم اعتماد القيمة المحسوبة آلياً.`
      );
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    canApprove: isValid,
    canPrint: true,
    errors,
    warnings,
    computedFields: {
      totalAvailable,
      paidLeaveDays,
      encashedDays,
      dailyWage,
      expectedRemaining,
      expectedLeavePayAmount
    }
  };
}

/**
 * 8. إدارة وحفظ سندات التسوية في التخزين الدائم (Vouchers Persistence Engine)
 */
export function getSavedSettlementVouchers(companyId?: string): LeaveSettlementVoucher[] {
  let vouchers = getPersistentData<LeaveSettlementVoucher[]>(
    MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, 
    []
  );

  // Automatic deduplication by voucherNumber or id
  const seenMap = new Map<string, LeaveSettlementVoucher>();
  const cleaned: LeaveSettlementVoucher[] = [];
  for (const v of vouchers) {
    const key = v.voucherNumber || v.id;
    if (key && !seenMap.has(key)) {
      seenMap.set(key, v);
      cleaned.push(v);
    }
  }
  if (cleaned.length !== vouchers.length) {
    setPersistentData(MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, cleaned);
    vouchers = cleaned;
  }

  if (!companyId || companyId === 'comp-super-admin' || companyId === 'all') {
    return vouchers;
  }
  return vouchers.filter(v => v.companyId === companyId);
}

export function saveSettlementVoucher(voucher: LeaveSettlementVoucher): LeaveSettlementVoucher[] {
  // 🔒 Odoo-style Constraint Validation before saving
  const validation = validateSettlementConstraints(voucher);
  if (!validation.isValid) {
    console.error('[Settlement Save Blocked by Odoo Constraints]:', validation.errors);
    throw new Error(validation.errors.join(' | '));
  }

  const existing = getPersistentData<LeaveSettlementVoucher[]>(
    MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, 
    []
  );
  // Check if voucher with same id or voucherNumber already exists
  const index = existing.findIndex(v => v.id === voucher.id || (voucher.voucherNumber && v.voucherNumber === voucher.voucherNumber));
  let updated: LeaveSettlementVoucher[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...voucher, updatedAt: new Date().toISOString() };
  } else {
    // Also check if any other duplicate exists by voucherNumber
    const duplicateByNum = existing.find(v => v.voucherNumber && v.voucherNumber === voucher.voucherNumber);
    if (duplicateByNum) {
      // Update existing instead of creating new duplicate
      const dupIdx = existing.findIndex(v => v.id === duplicateByNum.id);
      updated = [...existing];
      updated[dupIdx] = { ...voucher, id: duplicateByNum.id, updatedAt: new Date().toISOString() };
    } else {
      updated = [voucher, ...existing];
    }
  }
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, updated);
  const savedVoucher = updated.find(v => v.id === voucher.id) || voucher;
  void setDoc(
    doc(db, 'leave_settlements', savedVoucher.id),
    cleanFirestoreData({ ...savedVoucher, companyId: savedVoucher.companyId }),
    { merge: true }
  ).catch(err => console.warn('[saveSettlementVoucher] Firestore mirror failed:', err));
  void upsertLeaveSettlementToSupabase(savedVoucher, savedVoucher.companyId).catch(() => false);
  return updated;
}

export function deleteSettlementVoucher(voucherId: string): LeaveSettlementVoucher[] {
  const existing = getPersistentData<LeaveSettlementVoucher[]>(
    MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, 
    []
  );
  const updated = existing.filter(v => v.id !== voucherId);
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, updated);
  return updated;
}

/**
 * 9. تسييل وتصفية رصيد الإجازات الفعلي في سجل التخصيصات (Encashment Execution)
 */
export function liquidateLeaveBalanceInAllocations(
  employeeId: string,
  encashedDays: number,
  allocations: HrLeaveAllocation[],
  onUpdateAllocations: (updated: HrLeaveAllocation[]) => void,
  employee?: Employee,
  onUpdateEmployee?: (updated: Employee) => void
): { success: boolean; deductedDays: number; message: string } {
  if (encashedDays <= 0) {
    return { success: false, deductedDays: 0, message: 'عدد أيام التصفية يجب أن يكون أكبر من الصفر' };
  }

  let empAllocations = allocations.filter(
    a => {
      const matchId = a.employeeId === employeeId || a.employeeId === employee?.id || a.employeeId === employee?.employeeCode;
      const matchEmpCode = employee?.employeeCode && (a.employeeId === employee.employeeCode || (a as any).employeeCode === employee.employeeCode);
      return (matchId || matchEmpCode) && 
             (a.leaveType === 'ANNUAL' || !a.leaveType) && 
             (a.state === 'validate' || a.state === 'confirm' || !a.state);
    }
  );

  let updatedAllocations = [...allocations];

  // If no allocations found, create a default annual allocation record so liquidation/zeroing succeeds
  if (empAllocations.length === 0 && employee) {
    const defaultAlloc: HrLeaveAllocation = {
      id: `alloc-default-${Date.now()}`,
      employeeId: employee.id,
      companyId: employee.companyId || '',
      name: `تخصيص سنوية - ${employee.fullNameAr}`,
      leaveType: 'ANNUAL',
      allocationType: 'regular',
      numberOfDays: employee.carriedOverBalance || employee.paid_days_remaining || encashedDays,
      consumedDays: 0,
      remainingDays: employee.carriedOverBalance || employee.paid_days_remaining || encashedDays,
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      state: 'validate',
      notes: 'تخصيص افتراضي للتسوية',
      createdAt: new Date().toISOString(),
    };
    updatedAllocations.push(defaultAlloc);
    empAllocations = [defaultAlloc];
  }

  // Sort allocations FIFO (Carried over first, then earliest date)
  const sortedAllocations = [...empAllocations].sort((a, b) => {
    if (a.allocationType === 'regular' && b.allocationType !== 'regular') return -1;
    if (b.allocationType === 'regular' && a.allocationType !== 'regular') return 1;
    return new Date(a.dateFrom || 0).getTime() - new Date(b.dateFrom || 0).getTime();
  });

  let remainingToEncash = encashedDays;

  for (const alloc of sortedAllocations) {
    if (remainingToEncash <= 0) break;
    const currentAllocIndex = updatedAllocations.findIndex(a => a.id === alloc.id);
    if (currentAllocIndex === -1) continue;

    const totalDays = Number(alloc.numberOfDays || 0);
    const consumedDays = Number(alloc.consumedDays || 0);
    const encashedDaysPrev = Number(alloc.encashedDays || 0);
    const availableInAlloc = Math.max(0, totalDays - consumedDays - encashedDaysPrev);
    if (availableInAlloc <= 0) continue;

    const deductFromThis = Math.min(availableInAlloc, remainingToEncash);
    const nextEncashedDays = Number((encashedDaysPrev + deductFromThis).toFixed(2));
    const newRemaining = Math.max(0, totalDays - consumedDays - nextEncashedDays);

    updatedAllocations[currentAllocIndex] = {
      ...alloc,
      encashedDays: nextEncashedDays,
      remainingDays: Number(newRemaining.toFixed(2)),
      notes: (alloc.notes || '') + ` [تم تسييل بدل نقدي / تسوية: ${deductFromThis} يوم]`,
    };

    remainingToEncash -= deductFromThis;
  }

  // Persist updated allocations
  onUpdateAllocations(updatedAllocations);
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_ALLOCATIONS, updatedAllocations);

  // If employee object is provided, update remaining leaves
  if (employee && onUpdateEmployee) {
    const currentBal = employee.paid_days_remaining ?? employee.carriedOverBalance ?? encashedDays;
    const newBal = Math.max(0, currentBal - encashedDays);
    const updatedEmp: Employee = {
      ...employee,
      paid_days_remaining: Number(newBal.toFixed(2)),
    };
    onUpdateEmployee(updatedEmp);
  }

  const successfullyEncashed = encashedDays - Math.max(0, remainingToEncash);

  // Record encashment deduction in canonical leave_requests (Firestore)
  if (successfullyEncashed > 0 && employee) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const leaveId = `encash-leave-${Date.now()}`;
      const newLeaveReq: LeaveRequest = {
        id: leaveId,
        employeeId: employee.id,
        companyId: employee.companyId || '',
        leaveType: 'ANNUAL',
        startDate: todayStr,
        endDate: todayStr,
        totalDays: Number(successfullyEncashed.toFixed(2)),
        reason: `تصفية نقدية لرصيد الإجازة: ${successfullyEncashed.toFixed(2)} يوم (Encashment & Liquidation)`,
        status: 'APPROVED',
        validatedBy: 'System HR Engine',
        validatedAt: new Date().toISOString(),
        hrNote: 'خصم تلقائي ناتج عن اعتماد تسييل ورصد البدل النقدي',
        createdAt: new Date().toISOString(),
      };
      void setDoc(
        doc(db, 'leave_requests', leaveId),
        cleanFirestoreData(newLeaveReq),
        { merge: true }
      ).catch((err) => console.error('Firestore encashment leave write failed:', err));
    } catch (e) {
      console.error('Error creating encashment leave record:', e);
    }
  }

  return {
    success: true,
    deductedDays: Number(successfullyEncashed.toFixed(2)),
    message: `تم بنجاح تسييل وصرف البدل النقدي لعدد ${successfullyEncashed.toFixed(2)} يوم من رصيد الإجازات وتحديث وتصفير الرصيد المعتمد.`,
  };
}

/**
 * 10. دالة اعتماد الإجازة والخصم التلقائي (Firestore — leave_requests)
 */
export const onLeaveValidate = async (
  params: LeaveValidationParams
): Promise<LeaveValidationResponse> => {
  const { employeeId, requestedDays, leaveId } = params;

  try {
    const leaveSnapshot = await getDoc(doc(db, 'leave_requests', leaveId));
    if (!leaveSnapshot.exists()) {
      return {
        status: 'error',
        message: 'تعذر العثور على طلب الإجازة',
        paidDays: 0,
        unpaidDays: 0,
        deductionSentToPayroll: false,
      };
    }

    const leave = leaveSnapshot.data() as any;
    const resolvedEmployeeId = leave.employeeId || employeeId;
    if (leave.employeeId && leave.employeeId !== employeeId) {
      return {
        status: 'error',
        message: 'معرف الموظف لا يطابق طلب الإجازة',
        paidDays: 0,
        unpaidDays: 0,
        deductionSentToPayroll: false,
      };
    }

    const result = await approveLeaveRequest(
      {
        id: leaveId,
        companyId: leave.companyId,
        employeeId: resolvedEmployeeId,
        leaveType: leave.leaveType || 'ANNUAL',
        totalDays: requestedDays,
        status: 'APPROVED',
      },
      'HR System (onLeaveValidate)'
    );

    if (result.unpaidDays > 0) {
      try {
        const inputId = `unpaid-leave-${leaveId}`;
        await setDoc(doc(db, 'payroll_inputs', inputId), cleanFirestoreData({
          id: inputId,
          companyId: leave.companyId || 'comp-super-admin',
          employeeId: resolvedEmployeeId,
          inputType: 'unpaid_leave_deduction',
          amount: 0,
          description: `تسجيل غياب زائد عدد ${result.unpaidDays} يوم (مخصوم من مدة الخدمة وليس من الراتب)`,
          date: new Date().toISOString(),
        }), { merge: true });
      } catch (err) {
        console.warn('Firestore payroll input note:', err);
      }
    }

    return {
      status: 'success',
      message: `تم اعتماد الإجازة بنجاح (براتب: ${result.paidDays} يوم، بدون راتب: ${result.unpaidDays} يوم)`,
      paidDays: result.paidDays,
      unpaidDays: result.unpaidDays,
      deductionSentToPayroll: result.unpaidDays > 0,
    };
  } catch (error: any) {
    console.warn('حدث خطأ أثناء اعتماد الإجازة:', error);
    return {
      status: 'error',
      message: error.message || 'فشلت عملية الاعتماد',
      paidDays: 0,
      unpaidDays: 0,
      deductionSentToPayroll: false,
    };
  }
};

/**
 * Function on_approve_settlement(settlement_id):
 * 1. Deduct encashed_days from employee_available_balance
 * 2. Update FIFO_Ledger (mark older allocations as consumed)
 * 3. Push payment amount to Payroll_Input
 * 4. Lock settlement record (Disable duplicate clicks)
 */
export async function on_approve_settlement(
  settlementId: string,
  allocations: HrLeaveAllocation[],
  onUpdateAllocations: (updated: HrLeaveAllocation[]) => void,
  employees: Employee[],
  onUpdateEmployees: (updated: Employee[]) => void
): Promise<{ success: boolean; message: string }> {
  const vouchers = getSavedSettlementVouchers();
  const voucherIndex = vouchers.findIndex(v => v.id === settlementId || v.voucherNumber === settlementId);
  if (voucherIndex === -1) {
    return { success: false, message: `سند التسوية غير موجود برقم ${settlementId}` };
  }

  const voucher = vouchers[voucherIndex];
  if (voucher.status === 'settled_locked' || voucher.status === 'paid') {
    return { success: false, message: `سند التسوية هذا (${voucher.voucherNumber}) معتمد ومقفل مسبقاً لمنع النقر المزدوج والتكرار.` };
  }

  const employee = employees.find(e => e.id === voucher.employeeId || e.employeeCode === voucher.employeeCode);
  const encashedDays = voucher.encashedLeaveDays || 0;

  // 1 & 2. Deduct encashed_days from employee_available_balance & update FIFO_Ledger
  if (encashedDays > 0 && employee) {
    liquidateLeaveBalanceInAllocations(
      employee.id,
      encashedDays,
      allocations,
      onUpdateAllocations,
      employee,
      (updatedEmp) => {
        const empIndex = employees.findIndex(e => e.id === updatedEmp.id);
        if (empIndex >= 0) {
          const newEmps = [...employees];
          newEmps[empIndex] = updatedEmp;
          onUpdateEmployees(newEmps);
        }
      }
    );
  }

  // 3. Push payment amount to Payroll_Input
  const settlementPayrollItem = {
    id: `payroll-settlement-${voucher.id}`,
    employeeId: voucher.employeeId,
    employeeName: voucher.employeeName,
    companyId: voucher.companyId,
    type: 'LEAVE_SETTLEMENT',
    amount: voucher.netSettlementPayout,
    month: voucher.settlementDate ? voucher.settlementDate.substring(0, 7) : new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString(),
  };
  await setDoc(
    doc(db, 'payslips', settlementPayrollItem.id),
    cleanFirestoreData(settlementPayrollItem),
    { merge: true }
  );

  // 4. Lock settlement record (Disable duplicate clicks / set status to settled_locked)
  vouchers[voucherIndex] = {
    ...voucher,
    status: 'settled_locked',
    updatedAt: new Date().toISOString(),
  };
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_SETTLEMENT_VOUCHERS, vouchers);

  return {
    success: true,
    message: `تم اعتماد سند التسوية (${voucher.voucherNumber}) وتحديث رصيد FIFO وتوجيه مبلغ التسييل (${voucher.netSettlementPayout} KWD) إلى مسير الرواتب بنجاح وقفل السند نهائياً.`
  };
}

