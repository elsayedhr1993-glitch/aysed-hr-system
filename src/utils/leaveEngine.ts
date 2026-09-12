import { Employee, Contract, LeaveRequest, HrLeaveAllocation } from '../types';
import { getGlobalOpeningBalance, getGlobalAccrued2026, getGlobalCompensatoryDays } from './kuwaitLaw';
import { computeFifoLeaveAllocations, buildEmployeeBaselineAllocations } from '../services/leaveService';
import { normalizeLeaveStatus, normalizeLeaveType } from './leaveModel';

export type LeaveLedgerSource =
  | 'carried_forward'
  | 'accrued_entitlement'
  | 'holiday_compensation'
  | 'manual_adjustment'
  | 'approved_leave_deduction';

export interface LeaveLedgerEntry {
  id: string;
  employeeId: string;
  companyId?: string;
  direction: 'credit' | 'debit';
  source: LeaveLedgerSource;
  days: number;
  effectiveDate: string;
  status: 'approved' | 'pending';
  referenceId?: string;
  notes?: string;
}

export interface LeaveBalanceEngineInput {
  employee: Employee;
  allocations?: HrLeaveAllocation[];
  leaves?: LeaveRequest[];
  contract?: Contract;
}

export interface LeaveBalanceSnapshot {
  entries: LeaveLedgerEntry[];
  carriedForwardDays: number;
  accruedDays: number;
  holidayCompensationDays: number;
  manualAdjustmentDays: number;
  approvedLeaveDeductionDays: number;
  totalBalance: number;
  dailyWage: number;
  cashLiability: number;
  basicSalary: number;
  comprehensiveSalary: number;
}

export interface LeaveRecord {
  type: 'annual' | 'unpaid' | 'sick' | 'compensation_holiday' | 'manual_adjustment';
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  date?: string;
  notes?: string;
}

export interface EmployeeLeaveSummary {
  carriedOverDays?: number;        // الرصيد المرحل من 2025
  accruedAnnualDays: number;       // الرصيد التراكمي المكتسب (2.5 شهرياً)
  holidayCompensationDays: number; // بدل العمل بالعطلات الرسمية
  manualAdjustments: number;       // أي تسويات أو إضافات يدوية
  usedLeaveDays: number;           // الإجازات المستهلكة المعتمدة
  totalAvailableDays: number;      // الرصيد الإجمالي القابل للاستخدام والصرف
  cashSettlementAmount: number;    // القيمة المالية المستحقة في حال الصرف
  dailyWageRate?: number;          // أجر اليوم (الراتب الأساسي / 26)
  basicSalary?: number;            // الراتب الأساسي
  comprehensiveSalary?: number;    // الراتب الأساسي (أو الشامل)
}

function roundDays(value: number): number {
  return Number((Number(value || 0)).toFixed(2));
}

function roundMoney(value: number): number {
  return Number((Number(value || 0)).toFixed(3));
}

export function normalizeLeaveBalanceInputs(
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = []
): { allocations: HrLeaveAllocation[]; leaves: LeaveRequest[] } {
  const normalizedAllocations = (allocations || []).map((allocation: any) => ({
    ...allocation,
    numberOfDays: Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0,
    consumedDays: Number(allocation.consumedDays || 0) || 0,
    remainingDays: allocation.remainingDays !== undefined
      ? Number(allocation.remainingDays) || 0
      : Math.max(0, (Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0) - (Number(allocation.consumedDays || 0) || 0)),
    allocationType: allocation.allocationType || 'regular',
    state: allocation.state || 'validate',
    name: allocation.name || allocation.notes,
    dateFrom: allocation.dateFrom || allocation.allocationDate || '2026-01-01',
    companyId: allocation.companyId || ''
  })) as HrLeaveAllocation[];

  const normalizedLeaves = (leaves || []).map((leave: any) => ({
    ...leave,
    totalDays: Number(leave.totalDays ?? leave.daysCount ?? leave.numberOfDays ?? leave.days ?? 0) || 0,
    paidDays: leave.paidDays !== undefined ? Number(leave.paidDays) || 0 : undefined,
    unpaidDays: leave.unpaidDays !== undefined ? Number(leave.unpaidDays) || 0 : undefined,
    status: String(leave.status || '').toUpperCase()
  })) as LeaveRequest[];

  return {
    allocations: normalizedAllocations,
    leaves: normalizedLeaves
  };
}

export function buildLeaveBalanceLedger(input: LeaveBalanceEngineInput): LeaveLedgerEntry[] {
  const { employee, contract } = input;
  const { allocations, leaves } = normalizeLeaveBalanceInputs(input.allocations, input.leaves);
  const data = buildLeaveRecordsFromEmployee(employee, allocations, leaves);
  const baselineAllocations = buildEmployeeBaselineAllocations(employee, allocations);
  const fifo = computeFifoLeaveAllocations(employee, baselineAllocations, leaves);
  const companyId = employee.companyId || (employee as any).company_id || contract?.companyId || '';
  const employeeId = employee.id;

  const entries: LeaveLedgerEntry[] = [
    {
      id: `lf-carry-${employeeId}`,
      employeeId,
      companyId,
      direction: 'credit',
      source: 'carried_forward',
      days: roundDays(data.carriedOver),
      effectiveDate: '2025-12-31',
      status: 'approved',
      notes: 'رصيد مرحل افتتاحي'
    },
    {
      id: `lf-accrued-${employeeId}`,
      employeeId,
      companyId,
      direction: 'credit',
      source: 'accrued_entitlement',
      days: roundDays(data.accrued2026),
      effectiveDate: employee.joinDate || (employee as any).hireDate || '2026-01-01',
      status: 'approved',
      notes: 'استحقاق الإجازات السنوي'
    }
  ];

  data.records
    .filter(record => record.type === 'compensation_holiday' && record.status === 'approved')
    .forEach((record, index) => {
      entries.push({
        id: `lf-holiday-${employeeId}-${index + 1}`,
        employeeId,
        companyId,
        direction: 'credit',
        source: 'holiday_compensation',
        days: roundDays(record.days),
        effectiveDate: record.date || '2026-01-01',
        status: 'approved',
        notes: record.notes
      });
    });

  data.records
    .filter(record => record.type === 'manual_adjustment' && record.status === 'approved')
    .forEach((record, index) => {
      entries.push({
        id: `lf-adjust-${employeeId}-${index + 1}`,
        employeeId,
        companyId,
        direction: 'credit',
        source: 'manual_adjustment',
        days: roundDays(record.days),
        effectiveDate: record.date || '2026-01-01',
        status: 'approved',
        notes: record.notes
      });
    });

  fifo.breakdown.forEach((item, index) => {
    if ((Number(item.paidDays) || 0) <= 0) return;
    entries.push({
      id: `lf-deduct-${item.leaveId || employeeId}-${index + 1}`,
      employeeId,
      companyId,
      direction: 'debit',
      source: 'approved_leave_deduction',
      days: roundDays(item.paidDays),
      effectiveDate: item.leaveStartDate || '2026-01-01',
      status: 'approved',
      referenceId: item.leaveId,
      notes: `${item.leaveType || 'ANNUAL'} leave deduction`
    });
  });

  return entries.filter(entry => entry.days > 0);
}

export function calculateLeaveBalanceSnapshot(input: LeaveBalanceEngineInput): LeaveBalanceSnapshot {
  const { employee, contract } = input;
  const entries = buildLeaveBalanceLedger(input);
  const basicSalary = Number(contract?.basicSalary ?? (employee as any).basicSalary ?? (employee as any).basic_salary ?? (employee as any).salary ?? 0) || 0;
  const comprehensiveSalary = basicSalary;

  const carriedForwardDays = roundDays(entries.filter(entry => entry.source === 'carried_forward' && entry.direction === 'credit').reduce((sum, entry) => sum + entry.days, 0));
  const accruedDays = roundDays(entries.filter(entry => entry.source === 'accrued_entitlement' && entry.direction === 'credit').reduce((sum, entry) => sum + entry.days, 0));
  const holidayCompensationDays = roundDays(entries.filter(entry => entry.source === 'holiday_compensation' && entry.direction === 'credit').reduce((sum, entry) => sum + entry.days, 0));
  const manualAdjustmentDays = roundDays(entries.filter(entry => entry.source === 'manual_adjustment' && entry.direction === 'credit').reduce((sum, entry) => sum + entry.days, 0));
  const approvedLeaveDeductionDays = roundDays(entries.filter(entry => entry.source === 'approved_leave_deduction' && entry.direction === 'debit').reduce((sum, entry) => sum + entry.days, 0));
  const totalCredits = roundDays(carriedForwardDays + accruedDays + holidayCompensationDays + manualAdjustmentDays);
  const totalBalance = roundDays(Math.max(0, totalCredits - approvedLeaveDeductionDays));
  const dailyWage = roundMoney(basicSalary > 0 ? (basicSalary / 26) : 0);
  const cashLiability = roundMoney(totalBalance * dailyWage);

  return {
    entries,
    carriedForwardDays,
    accruedDays,
    holidayCompensationDays,
    manualAdjustmentDays,
    approvedLeaveDeductionDays,
    totalBalance,
    dailyWage,
    cashLiability,
    basicSalary,
    comprehensiveSalary
  };
}

export const LeaveBalanceEngine = {
  normalizeInputs: normalizeLeaveBalanceInputs,
  buildLedger: buildLeaveBalanceLedger,
  calculate: calculateLeaveBalanceSnapshot,
};

/**
 * المحرك المركزي الموحد لحساب رصيد وتصفية الإجازات
 * يضمن تطابق شاشة العرض مع شاشة الصرف مع مسير الرواتب 100%
 */
export function calculateUnifiedLeaveBalance(
  accruedAnnual: number,
  records: LeaveRecord[],
  basicSalary: number = 0,
  allowances: number = 0
): EmployeeLeaveSummary {
  
  // 1. تجميع الأيام التعويضية للعطلات المعتمدة فقط
  const holidayCompensationDays = records
    .filter(r => (r.type === 'compensation_holiday' || (r.type as string) === 'compensatory') && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);

  // 2. تجميع التعديلات اليدوية المعتمدة
  const manualAdjustments = records
    .filter(r => r.type === 'manual_adjustment' && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);

  // 3. تجميع الإجازات المستهلكة المعتمدة
  const usedLeaveDays = records
    .filter(r => (r.type === 'annual' || (r.type as string) === 'ANNUAL') && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);

  // 4. الرصيد الفعلي الحقيقي الشامل (المصدر الموحد للعرض والصرف بدقة عشرية مقفلة ومباشرة)
  const totalEarnedAndCarried = Number((Number(accruedAnnual || 0) + holidayCompensationDays + manualAdjustments).toFixed(2));
  const totalAvailableDays = Number((totalEarnedAndCarried - usedLeaveDays).toFixed(2));

  // 5. الحسبة المالية: أجر اليوم = (الراتب الأساسي فقط / Basic Salary) ÷ 26 (استبعاد جميع البدلات)
  const basicSalaryOnly = Number(basicSalary || 0);
  const dailyWageRate = basicSalaryOnly > 0 ? (basicSalaryOnly / 26) : 0;
  const cashSettlementAmount = Number((totalAvailableDays * dailyWageRate).toFixed(3));

  return {
    accruedAnnualDays: Number(accruedAnnual || 0),
    holidayCompensationDays,
    manualAdjustments,
    usedLeaveDays,
    totalAvailableDays,
    cashSettlementAmount,
    dailyWageRate: Number(dailyWageRate.toFixed(3)),
    basicSalary: basicSalaryOnly,
    comprehensiveSalary: basicSalaryOnly
  };
}

/**
 * دالة مساعدة لاستخراج سجلات الإجازات الموحدة من بيانات الموظف
 */
export function buildLeaveRecordsFromEmployee(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = []
): { 
  carriedOver: number;
  accrued2026: number;
  accruedAnnual: number; 
  records: LeaveRecord[]; 
  basicSalary: number; 
  allowances: number;
  compensatoryDays: number;
} {
  const empId = employee.id;
  const empCode = employee.employeeCode;

  // 1. حساب الراتب الأساسي والبدلات
  const basicSalary = Number((employee as any).basicSalary || (employee as any).basic_salary || (employee as any).salary || 0);
  const allowances = Number(
    Number((employee as any).housingAllowance || (employee as any).housing_allowance || 0) +
    Number((employee as any).transportAllowance || (employee as any).transport_allowance || 0) +
    Number((employee as any).otherAllowances || (employee as any).otherAllowance || (employee as any).other_allowances || 0)
  );

  // 2. استخدام المصدر الرسمي الموحد لحساب الرصيد المرحل والمكتسب الفعلي لعام 2026 (بدون افتراض 30 يوم كاملة)
  const carried = getGlobalOpeningBalance(employee);
  const accrued2026 = getGlobalAccrued2026(employee);
  const compensatoryDays = getGlobalCompensatoryDays(employee);
  const accruedAnnual = Number((carried + accrued2026).toFixed(2));

  // 3. بناء مصفوفة السجلات
  const records: LeaveRecord[] = [];

  // مخصصات بدل العطلات الرسمية
  allocations
    .filter(a => (a.employeeId === empId || a.employeeId === empCode) && (a.allocationType === 'compensatory_off' || (a.allocationType as string) === 'compensatory' || a.name?.includes('عطلة') || a.name?.includes('تعويضي')))
    .forEach(a => {
      records.push({
        type: 'compensation_holiday',
        days: Number(a.numberOfDays || 0),
        status: (a.state === 'validate' || (a.state as string) === 'approved') ? 'approved' : 'pending',
        date: a.dateFrom,
        notes: a.name
      });
    });

  // حقن فرق الأيام التعويضية من المصدر التشغيلي المركزي (Holiday Duties / Work on Holidays)
  // لمنع التكرار: نضيف فقط الفرق غير الموجود فعلياً داخل التخصيصات.
  const recordedCompensatory = records
    .filter(r => r.type === 'compensation_holiday' && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);
  const compensatoryDelta = Number((Math.max(0, compensatoryDays - recordedCompensatory)).toFixed(2));
  if (compensatoryDelta > 0) {
    records.push({
      type: 'compensation_holiday',
      days: compensatoryDelta,
      status: 'approved',
      date: new Date().toISOString().split('T')[0],
      notes: 'Holiday Duty (Article 68) compensatory credit'
    });
  }

  // تسويات يدوية أخرى
  allocations
    .filter(a => (a.employeeId === empId || a.employeeId === empCode) && ((a.allocationType as string) === 'manual_adjustment' || a.name?.includes('تسوية') || a.name?.includes('تعديل')))
    .forEach(a => {
      records.push({
        type: 'manual_adjustment',
        days: Number(a.numberOfDays || 0),
        status: (a.state === 'validate' || (a.state as string) === 'approved') ? 'approved' : 'pending',
        date: a.dateFrom,
        notes: a.name
      });
    });

  // الإجازات المستهلكة
  leaves
    .filter(l => {
      if (l.isHistorical) return false;
      const lAny = l as any;
      const employeeName = String(employee.fullNameAr || (employee as any).nameAr || employee.name || '').trim();
      const leaveName = String(lAny.employeeName || lAny.employee_name || lAny.nameAr || lAny.name || '').trim();
      const matchesEmployee = (l.employeeId === empId || l.employeeId === empCode) || (employeeName && leaveName && employeeName === leaveName);
      if (!matchesEmployee) return false;

      const status = normalizeLeaveStatus(l.status || lAny.state || lAny.status);
      return status === 'APPROVED' || status === 'RETURNED';
    })
    .forEach(l => {
      const normalizedType = normalizeLeaveType(l.leaveType);
      records.push({
        type: normalizedType === 'UNPAID' ? 'unpaid' : normalizedType === 'SICK' ? 'sick' : 'annual',
        days: Number(l.totalDays || (l as any).numberOfDays || (l as any).days || 0),
        status: 'approved',
        date: l.startDate,
        notes: l.reason || (l as any).name || (l as any).notes
      });
    });

  return {
    carriedOver: carried,
    accrued2026,
    accruedAnnual,
    records,
    basicSalary,
    allowances,
    compensatoryDays
  };
}

/**
 * حساب الملخص الموحد الشامل للموظف
 */
export function getEmployeeUnifiedSummary(
  employee: Employee,
  allocations: HrLeaveAllocation[] = [],
  leaves: LeaveRequest[] = [],
  contract?: Contract
): EmployeeLeaveSummary {
  const snapshot = calculateLeaveBalanceSnapshot({ employee, allocations, leaves, contract });

  return {
    carriedOverDays: snapshot.carriedForwardDays,
    accruedAnnualDays: snapshot.accruedDays,
    holidayCompensationDays: snapshot.holidayCompensationDays,
    manualAdjustments: snapshot.manualAdjustmentDays,
    usedLeaveDays: snapshot.approvedLeaveDeductionDays,
    totalAvailableDays: snapshot.totalBalance,
    cashSettlementAmount: snapshot.cashLiability,
    dailyWageRate: snapshot.dailyWage,
    basicSalary: snapshot.basicSalary,
    comprehensiveSalary: snapshot.comprehensiveSalary
  };
}

/**
 * calculateNetWorkingDays
 * Excludes Fridays and public holidays from the date range.
 * Assumes a standard Kuwait work week where Friday is off.
 */
export function calculateNetWorkingDays(startDate: string, endDate: string, holidaysList: any[] = []): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;
  
  let netDays = 0;
  let current = new Date(start);
  
  while (current <= end) {
    // 5 = Friday
    const isFriday = current.getDay() === 5;
    
    // Check if it's a public holiday
    const dateString = current.toISOString().split('T')[0];
    const isHoliday = holidaysList.some(h => {
      if (h.date) return h.date === dateString;
      if (h.startDate && h.endDate) {
        return dateString >= h.startDate && dateString <= h.endDate;
      }
      return false;
    });

    if (!isFriday && !isHoliday) {
      netDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return netDays;
}

export function computeLeaveRequest(
  employee: Employee, 
  startDate: string, 
  endDate: string, 
  holidaysList: any[] = [],
  totalAvailable: number = 0,
  ticketAllowance: number = 0
) {
  const totalNetDays = calculateNetWorkingDays(startDate, endDate, holidaysList);
  
  const paidDays = Number((Math.min(totalNetDays, Math.max(0, totalAvailable))).toFixed(2));
  const unpaidDays = Number((Math.max(0, totalNetDays - totalAvailable)).toFixed(2));
  const balanceAfter = Number((Math.max(0, totalAvailable - totalNetDays)).toFixed(2));
  
  // Kuwait Law: daily wage = Basic Salary / 26 (Allowances excluded)
  const basicSalary = Number((employee as any).basicSalary || (employee as any).basic_salary || (employee as any).salary || 0);
  const dailyWage = basicSalary > 0 ? (basicSalary / 26) : 0;
  
  const paidLeavePay = Math.round(paidDays * dailyWage * 1000) / 1000;
  const netPayable = paidLeavePay + (ticketAllowance || 0);

  return {
    totalNetDays,
    totalAvailable,
    paidDays,
    unpaidDays,
    balanceAfter,
    dailyWage,
    paidLeavePay,
    netPayable
  };
}

export interface LeaveMetricsResult {
  accruedBalance: number;
  totalBalance: number;
  paidDays: number;
  unpaidDays: number;
  dailyWage: number;
  totalLeavePay: number;
  endingBalance: number;
  bereavementStatutoryDays?: number;
  annualDeductedDays?: number;
  isSplitBereavement?: boolean;
  explanation?: string;
}

export const calculateAysedLeaveMetrics = (
  dateFrom: string,
  dateTo: string,
  netAvailable: number = 0,
  monthlyWage: number = 0,
  joiningDate: string = '2026-01-01',
  previousApprovedLeaves: number = 0,
  publicHolidays: string[] = [],
  leaveType: string = 'ANNUAL',
  bereavementDegree: 'FIRST' | 'SECOND' | 'OTHER' = 'FIRST'
): LeaveMetricsResult => {
  const totalAvailable = Math.max(0, Number(netAvailable) || 0);

  // 1. Count requested days (excluding Fridays and public holidays)
  let requestedDays = 0;
  const current = new Date(dateFrom);
  const end = new Date(dateTo);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 5 = Friday
    const dateStr = current.toISOString().split('T')[0];
    if (dayOfWeek !== 5 && !publicHolidays.includes(dateStr)) {
      requestedDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  // 2. Split paid vs unpaid based on leaveType
  let paidDays = 0;
  let unpaidDays = 0;
  let endingBalance = totalAvailable;
  let bereavementStatutoryDays = 0;
  let annualDeductedDays = 0;
  let isSplitBereavement = false;
  let explanation = '';

  if (leaveType === 'BEREAVEMENT' || leaveType === 'COMPASSIONATE') {
    // Kuwait Labor Law Article 77:
    // 3 days fully paid without deduction from annual balance for 1st & 2nd degree relatives
    const statutoryCap = (bereavementDegree === 'FIRST' || bereavementDegree === 'SECOND') ? 3 : 0;
    bereavementStatutoryDays = Math.min(requestedDays, statutoryCap);
    const remainingDays = Math.max(0, requestedDays - bereavementStatutoryDays);

    if (remainingDays === 0) {
      // Within 3 days statutory limit
      paidDays = requestedDays;
      unpaidDays = 0;
      annualDeductedDays = 0;
      endingBalance = totalAvailable;
      isSplitBereavement = false;
      explanation = `إجازة عزاء مستحقة وفق المادة 77 (${bereavementStatutoryDays} أيام مدفوعة بالكامل - خصم 0 من الرصيد السنوي)`;
    } else {
      // Extended duration (e.g. 14 days total -> 3 bereavement + 11 annual)
      isSplitBereavement = true;
      annualDeductedDays = Math.min(totalAvailable, remainingDays);
      unpaidDays = Math.max(0, remainingDays - annualDeductedDays);
      paidDays = bereavementStatutoryDays + annualDeductedDays;
      endingBalance = Math.max(0, totalAvailable - annualDeductedDays);
      explanation = `تم تطبيق دمج المادة 77: ${bereavementStatutoryDays} أيام عزاء مدفوعة بالكامل (بدون خصم) + ${annualDeductedDays} يوم مستقطعة من الرصيد السنوي${unpaidDays > 0 ? ` + ${unpaidDays} يوم بدون راتب` : ''}`;
    }
  } else if (['COMPENSATORY', 'SICK', 'MATERNITY', 'HAJJ', 'HOURLY_PERMISSION'].includes(leaveType)) {
    paidDays = requestedDays;
    unpaidDays = 0;
    endingBalance = totalAvailable; // Does not deduct from annual leave balance
  } else if (leaveType === 'UNPAID') {
    paidDays = 0;
    unpaidDays = requestedDays;
    endingBalance = totalAvailable;
  } else {
    // ANNUAL leave
    paidDays = Math.min(totalAvailable, requestedDays);
    unpaidDays = Math.max(0, requestedDays - totalAvailable);
    endingBalance = Math.max(0, totalAvailable - paidDays);
  }

  // 3. Article 70 Financial Calculation (Daily Wage = Wage / 26)
  const wage = Number(monthlyWage) || 0;
  const dailyWage = wage > 0 ? wage / 26 : 0;
  const leavePay = paidDays * dailyWage;

  return {
    accruedBalance: Number(totalAvailable.toFixed(2)),
    totalBalance: Number(totalAvailable.toFixed(2)),
    paidDays: Number(paidDays.toFixed(2)),
    unpaidDays: Number(unpaidDays.toFixed(2)),
    dailyWage: Number(dailyWage.toFixed(3)),
    totalLeavePay: Number(leavePay.toFixed(3)),
    endingBalance: Number(endingBalance.toFixed(2)),
    bereavementStatutoryDays,
    annualDeductedDays,
    isSplitBereavement,
    explanation
  };
};

export interface SettlementConstraintViolation {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SettlementConstraintResult {
  isValid: boolean;
  violations: SettlementConstraintViolation[];
}

/**
 * Validates mathematical integrity and constraints for leave settlements:
 * - Negative balance protection: spent days cannot exceed (carried + accrued).
 * - Exact mathematical identity: remaining === (carried + accrued) - spent.
 * - Non-negative operands.
 */
export function validateSettlementConstraints(params: {
  carriedOverBalance: number;
  accruedBalance: number;
  consumedLeaveDays: number;
  remainingBalanceAfter: number;
  basicSalary: number;
  dailyWage?: number;
}): SettlementConstraintResult {
  const violations: SettlementConstraintViolation[] = [];

  const carried = Number(params.carriedOverBalance) || 0;
  const accrued = Number(params.accruedBalance) || 0;
  const spent = Number(params.consumedLeaveDays) || 0;
  const remaining = Number(params.remainingBalanceAfter) || 0;
  const totalAvailable = carried + accrued;

  if (spent < 0) {
    violations.push({
      field: 'consumedLeaveDays',
      message: 'أيام الإجازة المصروفة لا يمكن أن تكون قيمة سالبة.',
      severity: 'error'
    });
  }

  if (spent > totalAvailable + 0.001) {
    violations.push({
      field: 'consumedLeaveDays',
      message: `أيام الإجازة المصروفة (${spent} يوم) تتجاوز إجمالي الرصيد المتاح (${totalAvailable.toFixed(2)} يوم).`,
      severity: 'error'
    });
  }

  const expectedRemaining = Number((totalAvailable - spent).toFixed(2));
  if (Math.abs(remaining - expectedRemaining) > 0.01) {
    violations.push({
      field: 'remainingBalanceAfter',
      message: `تضارب رياضي: الرصيد المتبقي (${remaining}) لا يطابق المعادلة: (${carried} مرحل + ${accrued} مكتسب) - ${spent} مصروف = ${expectedRemaining}.`,
      severity: 'error'
    });
  }

  if (params.basicSalary < 0) {
    violations.push({
      field: 'basicSalary',
      message: 'الراتب الأساسي لا يمكن أن يكون سالباً.',
      severity: 'error'
    });
  }

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations
  };
}
