import { doc, writeBatch } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { Employee, HrLeaveAllocation } from '../types';
import { toEmployeeFirestoreData } from '../utils/employeeMapper';
import { buildContractRunningLeaveAllocationRecord } from '../utils/contractLeaveTrigger';
import { normalizeContractStatus } from '../utils/contractStatus';
import { requireCompanyId } from '../utils/tenantGuards';

export class EmployeeOnboardingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmployeeOnboardingValidationError';
  }
}

export interface EmployeeOnboardingInput {
  companyId: string;
  employee: Partial<Employee> & Record<string, any>;
  existingEmployees?: Array<Partial<Employee> & Record<string, any>>;
}

export interface EmployeeOnboardingBundle {
  employee: Partial<Employee> & Record<string, any>;
  contract: Record<string, any>;
  commencement: Record<string, any>;
  leaveAllocation: HrLeaveAllocation | null;
}

function normalizeEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function normalizeIban(value: unknown): string {
  return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function normalizeCivilId(value: unknown): string {
  return String(value || '').trim();
}

function normalizeContractType(value: unknown): 'FIXED_TERM' | 'INDEFINITE' {
  const text = String(value || '').toLowerCase();
  if (text.includes('غير محدد') || text.includes('indefinite')) {
    return 'INDEFINITE';
  }
  return 'FIXED_TERM';
}

function normalizeEmployeeDraft(employee: Partial<Employee> & Record<string, any>, companyId: string): Partial<Employee> & Record<string, any> {
  const cleanCivilId = normalizeCivilId(employee.civilId || employee.civil_id_number || employee.civil_id);
  const cleanEmail = normalizeEmail(employee.email || employee.workEmail || employee.work_email);
  const cleanIban = normalizeIban(employee.iban || employee.bankIban || employee.bank_iban);
  const baseSalary = Number(employee.basicSalary ?? employee.contractSalary ?? employee.salary ?? 0) || 0;
  const housingAllowance = Number(employee.housingAllowance ?? 0) || 0;
  const transportAllowance = Number(employee.transportAllowance ?? 0) || 0;
  const medicalAllowance = Number(employee.medicalAllowance ?? 0) || 0;
  const otherAllowance = Number(employee.otherAllowances ?? employee.otherAllowance ?? 0) || 0;
  const totalSalary = Number(employee.totalSalary ?? employee.salary ?? (baseSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance)) || 0;
  const joinDate = String(employee.joinDate || employee.hireDate || employee.contractStartDate || employee.commencementDate || new Date().toISOString().split('T')[0]);
  const fullNameAr = String(employee.fullNameAr || employee.nameAr || employee.name || '').trim() || 'موظف جديد';
  const fullNameEn = String(employee.fullNameEn || employee.nameEn || '').trim();
  const department = String(employee.department || employee.dept || '').trim() || 'العموم';
  const jobTitle = String(employee.jobTitle || employee.jobPositionAr || '').trim() || 'موظف';
  const isCommenced = employee.isCommenced !== false;
  const canonicalContractStatus = normalizeContractStatus(employee.contractStatus || employee.status || (isCommenced ? 'running' : 'draft'));

  return {
    ...employee,
    id: String(employee.id || `EMP-${Date.now().toString().slice(-6)}`),
    companyId,
    company_id: companyId,
    civilId: cleanCivilId,
    civil_id: cleanCivilId,
    civil_id_number: cleanCivilId,
    email: cleanEmail,
    workEmail: cleanEmail,
    iban: cleanIban,
    fullNameAr,
    nameAr: fullNameAr,
    name: fullNameAr,
    fullNameEn,
    nameEn: fullNameEn,
    department,
    dept: department,
    jobTitle,
    joinDate,
    hireDate: joinDate,
    contractStartDate: String(employee.contractStartDate || joinDate),
    commencementDate: String(employee.commencementDate || employee.actualJoiningDate || joinDate),
    basicSalary: baseSalary,
    contractSalary: baseSalary,
    housingAllowance,
    transportAllowance,
    medicalAllowance,
    otherAllowance,
    otherAllowances: otherAllowance,
    allowances: housingAllowance + transportAllowance + medicalAllowance + otherAllowance,
    totalSalary,
    salary: totalSalary,
    bankName: String(employee.bankName || '').trim(),
    status: isCommenced ? 'ACTIVE' : 'ONBOARDING',
    contractStatus: canonicalContractStatus,
    isCommenced,
    leaveAccrualActivated: employee.leaveAccrualActivated !== false,
    tags: Array.isArray(employee.tags) ? employee.tags : []
  };
}

export function validateEmployeeOnboardingInput(input: EmployeeOnboardingInput): Partial<Employee> & Record<string, any> {
  const companyId = requireCompanyId(input.companyId);
  const draft = normalizeEmployeeDraft(input.employee, companyId);
  const companyEmployees = (input.existingEmployees || []).filter(existing => String(existing.companyId || existing.company_id || '').trim() === companyId && String(existing.id || '') !== String(draft.id || ''));

  if (!draft.fullNameAr) {
    throw new EmployeeOnboardingValidationError('اسم الموظف مطلوب لإتمام التسجيل.');
  }
  if (!draft.civilId) {
    throw new EmployeeOnboardingValidationError('الرقم المدني مطلوب لإتمام التسجيل.');
  }
  if (!draft.email) {
    throw new EmployeeOnboardingValidationError('البريد الوظيفي مطلوب لإتمام التسجيل.');
  }
  if (!draft.bankName || !draft.iban) {
    throw new EmployeeOnboardingValidationError('بيانات البنك والآيبان مطلوبة لإخراج الموظف جاهزاً للرواتب.');
  }

  const duplicateCivilId = companyEmployees.some(existing => normalizeCivilId(existing.civilId || existing.civil_id_number || existing.civil_id) === draft.civilId);
  if (duplicateCivilId) {
    throw new EmployeeOnboardingValidationError('الرقم المدني مكرر داخل نفس الشركة.');
  }

  const duplicateEmail = companyEmployees.some(existing => normalizeEmail(existing.email || existing.workEmail || existing.work_email) === draft.email);
  if (duplicateEmail) {
    throw new EmployeeOnboardingValidationError('البريد الوظيفي مكرر داخل نفس الشركة.');
  }

  const duplicateIban = companyEmployees.some(existing => normalizeIban(existing.iban || existing.bankIban || existing.bank_iban) === draft.iban);
  if (duplicateIban) {
    throw new EmployeeOnboardingValidationError('رقم الآيبان مكرر داخل نفس الشركة.');
  }

  return draft;
}

function buildContractRecord(employee: Partial<Employee> & Record<string, any>, companyId: string): Record<string, any> {
  const contractType = normalizeContractType(employee.contractType);
  const contractStatus = normalizeContractStatus(employee.contractStatus || (employee.isCommenced ? 'running' : 'draft'));
  return {
    id: `contract-${companyId}-${employee.id}`,
    employeeId: employee.id,
    employeeName: employee.fullNameAr,
    civilId: employee.civilId,
    jobTitle: employee.jobTitle,
    department: employee.department,
    bankName: employee.bankName,
    iban: employee.iban,
    companyId,
    basicSalary: Number(employee.basicSalary) || 0,
    housingAllowance: Number(employee.housingAllowance) || 0,
    transportAllowance: Number(employee.transportAllowance) || 0,
    otherAllowance: Number(employee.otherAllowances ?? employee.otherAllowance) || 0,
    contractType,
    startDate: String(employee.contractStartDate || employee.joinDate || new Date().toISOString().split('T')[0]),
    endDate: String(employee.contractEndDate || ''),
    noticePeriodDays: Number(employee.noticePeriodDays || 90) || 90,
    status: contractStatus,
    contractStatus,
    customDailyHours: Number(employee.dailyWorkHours ?? employee.dailyHours ?? 8) || 8,
    workingHoursPerWeek: Number(employee.weeklyWorkHours ?? employee.weeklyHours ?? 48) || 48,
    workingSchedule: employee.workingSchedule || 'الدوام الصباحي القياسي 8 ساعات',
    resourceCalendarId: employee.resourceCalendarId || 'cal-std-8h-6d',
    workHoursType: employee.workHoursType || 'STANDARD',
    shiftId: employee.shiftId || 'shift-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildCommencementRecord(employee: Partial<Employee> & Record<string, any>, companyId: string, contract: Record<string, any>): Record<string, any> {
  const isCommenced = employee.isCommenced !== false;
  const actualJoiningDate = String(employee.commencementDate || employee.actualJoiningDate || employee.joinDate || contract.startDate || new Date().toISOString().split('T')[0]);
  return {
    id: `commencement-${companyId}-${employee.id}`,
    employeeId: employee.id,
    employeeName: employee.fullNameAr,
    civilId: employee.civilId,
    companyId,
    actualJoiningDate,
    commencementDate: actualJoiningDate,
    contractType: contract.contractType,
    shiftId: contract.shiftId || 'shift-1',
    resourceCalendarId: contract.resourceCalendarId || 'cal-std-8h-6d',
    workingSchedule: contract.workingSchedule || 'الدوام الصباحي القياسي 8 ساعات',
    workHoursType: contract.workHoursType || 'STANDARD',
    dailyHours: Number(employee.dailyWorkHours ?? employee.dailyHours ?? 8) || 8,
    weeklyHours: Number(employee.weeklyWorkHours ?? employee.weeklyHours ?? 48) || 48,
    workDays: Array.isArray(employee.workDays) ? employee.workDays : ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    departmentId: String(employee.departmentId || 'dept-1'),
    department: employee.department,
    location: employee.branchLocation || employee.workLocation || employee.branchName || 'المقر الرئيسي - مدينة الكويت',
    approvedBy: 'نظام التهيئة الموحد',
    approvalDate: isCommenced ? new Date().toISOString().split('T')[0] : '',
    storageFolderUrl: `supabase://storage/v1/bucket/employees/${employee.id}/archive-vault`,
    status: isCommenced ? 'APPROVED' : 'PENDING',
    notes: employee.commencementNotes || 'تم إنشاء مباشرة العمل تلقائياً عبر مسار التهيئة الموحد.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function buildEmployeeOnboardingBundle(input: EmployeeOnboardingInput): EmployeeOnboardingBundle {
  const companyId = requireCompanyId(input.companyId);
  const employee = validateEmployeeOnboardingInput({ ...input, companyId });
  const contract = buildContractRecord(employee, companyId);
  const commencement = buildCommencementRecord(employee, companyId, contract);
  const leaveAllocation = employee.leaveAccrualActivated !== false
    ? buildContractRunningLeaveAllocationRecord({
        employeeId: String(employee.id),
        employeeName: String(employee.fullNameAr || employee.nameAr || 'موظف'),
        contractStartDate: String(contract.startDate),
        contractStatus: String(contract.status),
        companyId
      })
    : null;

  return {
    employee,
    contract,
    commencement,
    leaveAllocation
  };
}

export async function createEmployeeOnboardingBundle(input: EmployeeOnboardingInput): Promise<EmployeeOnboardingBundle> {
  const bundle = buildEmployeeOnboardingBundle(input);
  const batch = writeBatch(db);

  batch.set(doc(db, 'employees', String(bundle.employee.id)), cleanFirestoreData(toEmployeeFirestoreData(bundle.employee, bundle.employee.companyId)), { merge: true });
  batch.set(doc(db, 'contracts', String(bundle.contract.id)), cleanFirestoreData(bundle.contract), { merge: true });
  batch.set(doc(db, 'commencements', String(bundle.commencement.id)), cleanFirestoreData(bundle.commencement), { merge: true });
  if (bundle.leaveAllocation) {
    batch.set(doc(db, 'leave_allocations', String(bundle.leaveAllocation.id)), cleanFirestoreData(bundle.leaveAllocation), { merge: true });
  }

  await batch.commit();
  return bundle;
}