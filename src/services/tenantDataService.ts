/**
 * Multi-Tenant Cloud-First Database Persistence Client
 * Defines schemas, adapters, and live CRUD operations for:
 * - `tenants` (companies/organizations)
 * - `employees`
 * - `leaves`
 * - `payroll_runs` & `payslips`
 * - `attendance`
 * - `contracts`
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, auth, cleanFirestoreData } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { Company, Employee, LeaveRequest, AttendanceRecord, Payslip, Contract } from '../types';
import { triggerContractRunningLeaveAllocation } from '../utils/contractLeaveTrigger';
import { saveHolidayWorkRecord, approveHolidayWork, WorkOnHolidayRecord } from './holidayWorkService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isIgnorable =
    errMessage.includes('unavailable') ||
    errMessage.includes('offline') ||
    errMessage.includes('closing') ||
    errMessage.includes('hidden') ||
    errMessage.includes('Database is closing') ||
    errMessage.includes('Failed to get document because the client is offline') ||
    errMessage.includes('Could not reach Cloud Firestore backend') ||
    errMessage.includes('cancelled') ||
    errMessage.includes('terminated');

  if (isIgnorable) {
    console.warn(`[TenantDatabaseService] Handled connection notice for ${path}:`, errMessage);
    return { error: errMessage, operationType, path };
  }

  const errInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[TenantDatabaseService] Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export interface TenantRecord {
  id: string;
  name_ar: string;
  name_en?: string;
  commercial_reg_no?: string;
  civil_id_company?: string;
  bank_name?: string;
  iban?: string;
  wsi_code?: string;
  currency?: string;
  status?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeRecord {
  id: string;
  company_id: string;
  employee_code: string;
  full_name_ar: string;
  full_name_en?: string;
  civil_id: string;
  civil_id_expiry?: string;
  passport_no?: string;
  passport_expiry?: string;
  nationality?: string;
  gender?: string;
  dob?: string;
  department?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  join_date?: string;
  moh_license_no?: string;
  moh_license_expiry?: string;
  status?: string;
  bank_name?: string;
  iban?: string;
  basic_salary?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  other_allowance?: number;
  total_salary?: number;
  carried_over_leave_2025?: number;
  accrued_leave_2026?: number;
  remaining_leaves?: number;
  raw_payload?: Record<string, any>;
  updated_at?: string;
}

export interface LeaveDbRecord {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  unpaid_days?: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollRunRecord {
  id: string;
  company_id: string;
  month: string;
  total_net_salary: number;
  total_basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  employee_count: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'TRANSFERRED';
  payment_method?: string;
  wsi_file_generated?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  payslips?: Array<Record<string, any>>;
}

// -------------------------------------------------------------
// ADAPTER HELPERS (Domain Entity <-> Supabase DB Row)
// -------------------------------------------------------------

export function toEmployeeDbRow(emp: Employee, companyId?: string): EmployeeRecord {
  const compId = companyId || emp.companyId || 'comp-super-admin';
  const civilExpiry = emp.civilIdExpiry || (emp as any).civilIdExpiryDate || (emp as any).civil_id_expiry || (emp as any).raw_payload?.civilIdExpiry || (emp as any).raw_payload?.civilIdExpiryDate || (emp as any).raw_payload?.civil_id_expiry || '';
  return {
    id: emp.id,
    company_id: compId,
    employee_code: emp.employeeCode || '',
    full_name_ar: emp.fullNameAr || (emp as any).nameAr || (emp as any).name || '',
    full_name_en: emp.fullNameEn || (emp as any).nameEn || '',
    civil_id: emp.civilId || (emp as any).civil_id_number || '',
    civil_id_expiry: civilExpiry,
    passport_no: emp.passportNo || '',
    passport_expiry: emp.passportExpiry || '',
    nationality: emp.nationality || '',
    gender: emp.gender || 'MALE',
    dob: emp.dob || (emp as any).birthDate || '',
    department: emp.department || (emp as any).dept || '',
    job_title: emp.jobTitle || '',
    email: emp.email || '',
    phone: emp.phone || '',
    join_date: emp.joinDate || (emp as any).hireDate || '',
    moh_license_no: emp.mohLicenseNo || (emp as any).mohLicense || '',
    moh_license_expiry: emp.mohLicenseExpiry || '',
    status: emp.status || 'ACTIVE',
    bank_name: emp.bankName || '',
    iban: emp.iban || '',
    basic_salary: Number((emp as any).basicSalary ?? (emp as any).contractSalary ?? (emp as any).salary ?? 0),
    housing_allowance: Number((emp as any).housingAllowance ?? 0),
    transport_allowance: Number((emp as any).transportAllowance ?? 0),
    other_allowance: Number((emp as any).otherAllowances ?? (emp as any).otherAllowance ?? 0),
    carried_over_leave_2025: (
      (emp.fullNameAr && (emp.fullNameAr.includes('بخيت') || emp.fullNameAr.includes('سويلم'))) ||
      ((emp as any).nameAr && ((emp as any).nameAr.includes('بخيت') || (emp as any).nameAr.includes('سويلم'))) ||
      emp.civilId === '293080106877'
    ) ? 0 : Number((emp as any).carriedOverLeave2025 ?? (emp as any).carriedOverBalance ?? (emp as any).openingBalance ?? 0),
    accrued_leave_2026: (emp as any).accruedLeave2026 || (emp as any).aysed_accrued_2026 || 0,
    remaining_leaves: emp.paid_days_remaining || 0,
    raw_payload: {
      ...emp,
      basicSalary: Number((emp as any).basicSalary ?? (emp as any).contractSalary ?? (emp as any).salary ?? 0),
      contractSalary: Number((emp as any).basicSalary ?? (emp as any).contractSalary ?? (emp as any).salary ?? 0),
      housingAllowance: Number((emp as any).housingAllowance ?? 0),
      transportAllowance: Number((emp as any).transportAllowance ?? 0),
      medicalAllowance: Number((emp as any).medicalAllowance ?? 0),
      otherAllowance: Number((emp as any).otherAllowances ?? (emp as any).otherAllowance ?? 0),
      otherAllowances: Number((emp as any).otherAllowances ?? (emp as any).otherAllowance ?? 0),
      allowances: Number((emp as any).allowances ?? (Number((emp as any).housingAllowance ?? 0) + Number((emp as any).transportAllowance ?? 0) + Number((emp as any).medicalAllowance ?? 0) + Number((emp as any).otherAllowances ?? (emp as any).otherAllowance ?? 0))),
      totalSalary: Number((emp as any).totalSalary ?? (Number((emp as any).basicSalary ?? (emp as any).contractSalary ?? (emp as any).salary ?? 0) + Number((emp as any).housingAllowance ?? 0) + Number((emp as any).transportAllowance ?? 0) + Number((emp as any).medicalAllowance ?? 0) + Number((emp as any).otherAllowances ?? (emp as any).otherAllowance ?? 0))),
      dob: emp.dob || (emp as any).birthDate || '',
      birthDate: (emp as any).birthDate || emp.dob || '',
      civilIdExpiry: civilExpiry,
      civilIdExpiryDate: civilExpiry,
      civil_id_expiry: civilExpiry
    } as any,
    updated_at: new Date().toISOString()
  };
}

export function fromEmployeeDbRow(row: any): Employee {
  const resolvedCompId = row.companyId || row.company_id || row.raw_payload?.companyId || row.raw_payload?.company_id || 'comp-super-admin';
  const civilExpiry = row.civil_id_expiry || row.civilIdExpiry || row.civilIdExpiryDate || row.raw_payload?.civilIdExpiry || row.raw_payload?.civilIdExpiryDate || row.raw_payload?.civil_id_expiry || '';

  const rawBasic = Number(row.raw_payload?.basicSalary ?? row.raw_payload?.contractSalary ?? row.basic_salary ?? row.basicSalary ?? row.raw_payload?.salary ?? row.salary ?? 0);
  const rawHousing = Number(row.raw_payload?.housingAllowance ?? row.housing_allowance ?? row.housingAllowance ?? 0);
  const rawTransport = Number(row.raw_payload?.transportAllowance ?? row.transport_allowance ?? row.transportAllowance ?? 0);
  const rawMedical = Number(row.raw_payload?.medicalAllowance ?? row.medical_allowance ?? row.medicalAllowance ?? 0);
  const rawOther = Number(row.raw_payload?.otherAllowances ?? row.raw_payload?.otherAllowance ?? row.other_allowances ?? row.other_allowance ?? row.otherAllowances ?? row.otherAllowance ?? 0);
  const rawAllowances = Number(row.raw_payload?.allowances ?? (rawHousing + rawTransport + rawMedical + rawOther));
  const rawTotal = Number(row.raw_payload?.totalSalary ?? row.totalSalary ?? (rawBasic + rawAllowances));

  const isElsayed = 
    (row.full_name_ar && (row.full_name_ar.includes('بخيت') || row.full_name_ar.includes('سويلم'))) ||
    (row.fullNameAr && (row.fullNameAr.includes('بخيت') || row.fullNameAr.includes('سويلم'))) ||
    (row.raw_payload?.fullNameAr && (row.raw_payload.fullNameAr.includes('بخيت') || row.raw_payload.fullNameAr.includes('سويلم'))) ||
    (row.raw_payload?.nameAr && (row.raw_payload.nameAr.includes('بخيت') || row.raw_payload.nameAr.includes('سويلم'))) ||
    row.civil_id === '293080106877' ||
    row.civilId === '293080106877' ||
    row.raw_payload?.civilId === '293080106877';

  const defaultCarried = isElsayed ? 0 : Number(row.raw_payload?.carriedOverLeave2025 ?? row.carried_over_leave_2025 ?? 0);

  if (row.raw_payload && typeof row.raw_payload === 'object') {
    return {
      ...row.raw_payload,
      id: row.id || row.raw_payload.id,
      companyId: resolvedCompId,
      company_id: resolvedCompId,
      fullNameAr: row.full_name_ar || row.fullNameAr || row.raw_payload.fullNameAr || row.raw_payload.nameAr || '',
      civilId: row.civil_id || row.civilId || row.raw_payload.civilId || row.raw_payload.civil_id_number || '',
      civilIdExpiry: civilExpiry,
      civilIdExpiryDate: civilExpiry,
      civil_id_expiry: civilExpiry,
      birthDate: row.raw_payload.birthDate || row.raw_payload.dob || row.dob || '',
      dob: row.raw_payload.dob || row.raw_payload.birthDate || row.dob || '',
      nationality: row.raw_payload.nationality || row.nationality || '',
      gender: row.raw_payload.gender || row.gender || 'MALE',
      passportNo: row.raw_payload.passportNo || row.passport_no || row.passportNo || '',
      residencyType: row.raw_payload.residencyType || row.residency_type || row.residencyType || '',
      basicSalary: rawBasic,
      contractSalary: rawBasic,
      housingAllowance: rawHousing,
      transportAllowance: rawTransport,
      medicalAllowance: rawMedical,
      otherAllowance: rawOther,
      otherAllowances: rawOther,
      allowances: rawAllowances,
      totalSalary: rawTotal,
      salary: rawTotal,
      carriedOverLeave2025: defaultCarried,
      carriedOverBalance: defaultCarried,
      openingBalance: defaultCarried,
    } as Employee;
  }
  return {
    id: row.id,
    companyId: resolvedCompId,
    company_id: resolvedCompId,
    employeeCode: row.employee_code || row.employeeCode || '',
    fullNameAr: row.full_name_ar || row.fullNameAr || '',
    fullNameEn: row.full_name_en || row.fullNameEn || '',
    civilId: row.civil_id || row.civilId || '',
    civilIdExpiry: civilExpiry,
    civilIdExpiryDate: civilExpiry,
    civil_id_expiry: civilExpiry,
    passportNo: row.passport_no || row.passportNo || '',
    passportExpiry: row.passport_expiry || row.passportExpiry || '',
    nationality: row.nationality || '',
    isKuwaiti: Boolean(
      row.nationality
        ? (row.nationality.includes('كويت') || row.nationality === 'كويتي')
        : (row.isKuwaiti || row.is_kuwaiti)
    ),
    residencyType: (row.residency_type || row.residencyType || (row.nationality?.includes('كويت') ? 'كويتي' : 'مادة 18 - قطاع أهلي')) as any,
    gender: (row.gender || 'MALE') as 'MALE' | 'FEMALE',
    dob: row.dob || row.birthDate || '',
    birthDate: row.dob || row.birthDate || '',
    department: row.department || '',
    jobTitle: row.job_title || row.jobTitle || '',
    email: row.email || '',
    phone: row.phone || '',
    joinDate: row.join_date || row.joinDate || '',
    mohLicenseNo: row.moh_license_no || row.mohLicenseNo || '',
    mohLicenseExpiry: row.moh_license_expiry || row.mohLicenseExpiry || '',
    status: (row.status || 'ACTIVE') as any,
    bankName: row.bank_name || row.bankName || '',
    iban: row.iban || '',
    tags: row.tags || [],
    basicSalary: rawBasic,
    contractSalary: rawBasic,
    housingAllowance: rawHousing,
    transportAllowance: rawTransport,
    medicalAllowance: rawMedical,
    otherAllowance: rawOther,
    otherAllowances: rawOther,
    allowances: rawAllowances,
    totalSalary: rawTotal,
    salary: rawTotal,
    carriedOverLeave2025: defaultCarried,
    carriedOverBalance: defaultCarried,
    openingBalance: defaultCarried,
  } as Employee;
}

export function toLeaveDbRow(leave: LeaveRequest, companyId?: string): LeaveDbRecord {
  return {
    id: leave.id,
    company_id: companyId || leave.companyId || 'comp-super-admin',
    employee_id: leave.employeeId,
    leave_type: leave.leaveType || (leave as any).type || 'ANNUAL',
    start_date: leave.startDate,
    end_date: leave.endDate,
    days: leave.totalDays || (leave as any).days || 0,
    unpaid_days: leave.unpaidDays || 0,
    reason: leave.reason || '',
    status: leave.status || 'APPROVED',
    approved_by: leave.validatedBy || (leave as any).approvedBy || 'HR Manager',
    approved_at: leave.validatedAt || (leave as any).approvedAt || new Date().toISOString(),
    created_at: leave.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function fromLeaveDbRow(row: any): LeaveRequest {
  return {
    id: row.id,
    companyId: row.company_id || row.companyId,
    employeeId: row.employee_id || row.employeeId,
    leaveType: (row.leave_type || row.leaveType || 'ANNUAL') as any,
    startDate: row.start_date || row.startDate,
    endDate: row.end_date || row.endDate,
    totalDays: Number(row.days || row.totalDays) || 0,
    unpaidDays: Number(row.unpaid_days || row.unpaidDays) || 0,
    reason: row.reason || '',
    status: (row.status || 'APPROVED') as any,
    validatedBy: row.approved_by || row.validatedBy,
    validatedAt: row.approved_at || row.validatedAt,
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  } as LeaveRequest;
}

// -------------------------------------------------------------
// 10 TEST EMPLOYEES CANONICAL DATASET (Offline-First Guaranteed)
// -------------------------------------------------------------

export function getTenProfessionalTestEmployees(targetCompanyId: string = 'comp-almanar'): Employee[] {
  const companyId = targetCompanyId || 'comp-almanar';
  return [
    {
      id: 'emp-kwt-doc-old',
      companyId,
      employeeCode: 'EMP-1001',
      fullNameAr: 'أ.د. أحمد فيصل المطيري',
      fullNameEn: 'Prof. Ahmed Al-Mutairi',
      civilId: '280051201121',
      civilIdExpiry: '2029-05-12',
      passportNo: 'K009123',
      passportExpiry: '2031-01-01',
      nationality: 'كويتي',
      isKuwaiti: true,
      residencyType: 'كويتي',
      gender: 'MALE',
      dob: '1980-05-12',
      department: 'الأطباء',
      jobTitle: 'استشاري أول جراحة قلب وأوعية دموية',
      email: 'dr.ahmed.mutairi@almanar.com',
      phone: '96599001122',
      joinDate: '2024-01-01',
      status: 'ACTIVE',
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW99KFH000000000000100100',
      basicSalary: 3000,
      contractSalary: 3000,
      housingAllowance: 500,
      transportAllowance: 200,
      medicalAllowance: 300,
      otherAllowance: 0,
      totalSalary: 4000,
      salary: 4000,
      carriedOverLeave2025: 18,
      carriedOverBalance: 18,
      openingBalance: 18,
      badgeId: '1001',
      biometricId: '1001',
      tags: ['أخصائي', 'كويتي', 'كادر طبي']
    },
    {
      id: 'emp-exp-doc-old',
      companyId,
      employeeCode: 'EMP-1002',
      fullNameAr: 'د. سامح محمد الحسيني',
      fullNameEn: 'Dr. Sameh Al-Husseini',
      civilId: '285110401493',
      civilIdExpiry: '2028-11-04',
      passportNo: 'A1192834',
      passportExpiry: '2029-11-04',
      nationality: 'مصري',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'MALE',
      dob: '1985-11-04',
      department: 'الأطباء',
      jobTitle: 'استشاري مشارك طب وجراحة العيون',
      email: 'dr.sameh.husseini@almanar.com',
      phone: '96599887766',
      joinDate: '2024-01-01',
      status: 'ACTIVE',
      bankName: 'بنك الخليج (Gulf Bank)',
      iban: 'KW55GULF000000000000100200',
      basicSalary: 2000,
      contractSalary: 2000,
      housingAllowance: 400,
      transportAllowance: 200,
      medicalAllowance: 200,
      otherAllowance: 0,
      totalSalary: 2800,
      salary: 2800,
      carriedOverLeave2025: 12,
      carriedOverBalance: 12,
      openingBalance: 12,
      badgeId: '1002',
      biometricId: '1002',
      tags: ['استشاري', 'وافد', 'كادر طبي']
    },
    {
      id: 'emp-wps-exp-1',
      companyId,
      employeeCode: 'EMP-1003',
      fullNameAr: 'ماريا جريس سيلفا',
      fullNameEn: 'Maria Grace Silva',
      civilId: '292031501234',
      civilIdExpiry: '2028-03-15',
      passportNo: 'P008124',
      passportExpiry: '2030-03-15',
      nationality: 'فلبيني',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'FEMALE',
      dob: '1992-03-15',
      department: 'التمريض',
      jobTitle: 'رئيسة تمريض العناية المركزة',
      email: 'maria.silva@almanar.com',
      phone: '96599112233',
      joinDate: '2025-02-01',
      status: 'ACTIVE',
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW12NBK0000000000000100300',
      basicSalary: 600,
      contractSalary: 600,
      housingAllowance: 200,
      transportAllowance: 100,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 900,
      salary: 900,
      carriedOverLeave2025: 0,
      carriedOverBalance: 0,
      openingBalance: 0,
      badgeId: '1003',
      biometricId: '1003',
      tags: ['تمريض', 'وافد']
    },
    {
      id: 'emp-kwt-admin-new',
      companyId,
      employeeCode: 'EMP-1004',
      fullNameAr: 'شريفة مساعد العازمي',
      fullNameEn: 'Sharifa Mosaed Al-Azmi',
      civilId: '295081001421',
      civilIdExpiry: '2030-08-10',
      passportNo: 'K008451',
      passportExpiry: '2033-08-10',
      nationality: 'كويتي',
      isKuwaiti: true,
      residencyType: 'كويتي',
      gender: 'FEMALE',
      dob: '1995-08-10',
      department: 'الموارد البشرية',
      jobTitle: 'أخصائي أول موارد بشرية وشؤون إدارية',
      email: 'sharifa.azmi@almanar.com',
      phone: '96599445566',
      joinDate: '2026-07-01',
      status: 'ACTIVE',
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW66NBK0000000000000100400',
      basicSalary: 950,
      contractSalary: 950,
      housingAllowance: 150,
      transportAllowance: 100,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 1200,
      salary: 1200,
      carriedOverLeave2025: 0,
      carriedOverBalance: 0,
      openingBalance: 0,
      badgeId: '1004',
      biometricId: '1004',
      tags: ['إداري', 'كويتي', 'تجربة']
    },
    {
      id: 'emp-probation-exp',
      companyId,
      employeeCode: 'EMP-1005',
      fullNameAr: 'راجيش كومار سينغ',
      fullNameEn: 'Rajesh Kumar Singh',
      civilId: '288071501982',
      civilIdExpiry: '2027-07-15',
      passportNo: 'Z009382',
      passportExpiry: '2029-07-15',
      nationality: 'هندي',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'MALE',
      dob: '1988-07-15',
      department: 'الخدمات المساندة',
      jobTitle: 'عامل صيانة ونظافة عامة',
      email: 'rajesh.kumar@almanar.com',
      phone: '96550506677',
      joinDate: '2026-08-15',
      status: 'PROBATION',
      bankName: 'بنك برقان (Burgan Bank)',
      iban: 'KW55BURG000000000000100500',
      basicSalary: 220,
      contractSalary: 220,
      housingAllowance: 50,
      transportAllowance: 30,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 300,
      salary: 300,
      carriedOverLeave2025: 0,
      carriedOverBalance: 0,
      openingBalance: 0,
      badgeId: '1005',
      biometricId: '1005',
      tags: ['عامل', 'تجربة']
    },
    {
      id: 'emp-unpaid-test',
      companyId,
      employeeCode: 'EMP-1006',
      fullNameAr: 'د. مصطفى خالد عثمان',
      fullNameEn: 'Dr. Mostafa Khaled Othman',
      civilId: '278061501192',
      civilIdExpiry: '2028-06-15',
      passportNo: 'E009213',
      passportExpiry: '2030-06-15',
      nationality: 'مصري',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'MALE',
      dob: '1978-06-15',
      department: 'الأطباء',
      jobTitle: 'أخصائي أول جراحة التجميل والترميم',
      email: 'dr.mostafa@almanar.com',
      phone: '96590012345',
      joinDate: '2025-06-01',
      status: 'ACTIVE',
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW44KFH000000000000100600',
      basicSalary: 1500,
      contractSalary: 1500,
      housingAllowance: 300,
      transportAllowance: 100,
      medicalAllowance: 100,
      otherAllowance: 0,
      totalSalary: 2000,
      salary: 2000,
      carriedOverLeave2025: 2,
      carriedOverBalance: 2,
      openingBalance: 2,
      badgeId: '1006',
      biometricId: '1006',
      tags: ['وافد', 'إجازة سارية', 'اختبار بدون راتب']
    },
    {
      id: 'emp-duty-test',
      companyId,
      employeeCode: 'EMP-1007',
      fullNameAr: 'ميرنا لوران سلفادور',
      fullNameEn: 'Myrna Lauren Salvador',
      civilId: '290041201944',
      civilIdExpiry: '2028-04-12',
      passportNo: 'P009842',
      passportExpiry: '2030-04-12',
      nationality: 'فلبيني',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'FEMALE',
      dob: '1990-04-12',
      department: 'التمريض',
      jobTitle: 'ممرضة قانونية - رعاية مركزة وأمومة',
      email: 'myrna.salvador@almanar.com',
      phone: '96594443322',
      joinDate: '2024-03-01',
      status: 'ACTIVE',
      bankName: 'بنك الخليج (Gulf Bank)',
      iban: 'KW22GULF000000000000100700',
      basicSalary: 550,
      contractSalary: 550,
      housingAllowance: 150,
      transportAllowance: 50,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 750,
      salary: 750,
      carriedOverLeave2025: 10,
      carriedOverBalance: 10,
      openingBalance: 10,
      badgeId: '1007',
      biometricId: '1007',
      tags: ['تمريض', 'إجازة معتمدة', 'اختبار مباشرة العمل']
    },
    {
      id: 'emp-zero-leave-test',
      companyId,
      employeeCode: 'EMP-1008',
      fullNameAr: 'هالة طارق الفضلي',
      fullNameEn: 'Hala Tariq Al-Fadhli',
      civilId: '297031101882',
      civilIdExpiry: '2030-03-11',
      passportNo: 'K009941',
      passportExpiry: '2032-03-11',
      nationality: 'كويتي',
      isKuwaiti: true,
      residencyType: 'كويتي',
      gender: 'FEMALE',
      dob: '1997-03-11',
      department: 'المحاسبة والمالية',
      jobTitle: 'محاسب عام وتدقيق رواتب',
      email: 'hala.fadhli@almanar.com',
      phone: '96597778899',
      joinDate: '2026-06-01',
      status: 'ACTIVE',
      bankName: 'بنك بوبيان (Boubyan Bank)',
      iban: 'KW00BOUB000000000000100800',
      basicSalary: 500,
      contractSalary: 500,
      housingAllowance: 80,
      transportAllowance: 50,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 630,
      salary: 630,
      carriedOverLeave2025: 0,
      carriedOverBalance: 0,
      openingBalance: 0,
      badgeId: '1008',
      biometricId: '1008',
      tags: ['إداري', 'رصيد صفر']
    },
    {
      id: 'emp-exp-doc-alert',
      companyId,
      employeeCode: 'EMP-1009',
      fullNameAr: 'د. كمال عاطف البغدادي',
      fullNameEn: 'Dr. Kamal Al-Baghdadi',
      civilId: '281090101893',
      civilIdExpiry: '2026-08-15',
      passportNo: 'A009182',
      passportExpiry: '2028-09-01',
      nationality: 'سوري',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'MALE',
      dob: '1981-09-01',
      department: 'الأطباء',
      jobTitle: 'أخصائي تركيبات وزراعة الأسنان',
      email: 'dr.kamal@almanar.com',
      phone: '96590099887',
      joinDate: '2024-09-01',
      status: 'ACTIVE',
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW11KFH000000000000100900',
      basicSalary: 1600,
      contractSalary: 1600,
      housingAllowance: 200,
      transportAllowance: 100,
      medicalAllowance: 100,
      otherAllowance: 0,
      totalSalary: 2000,
      salary: 2000,
      carriedOverLeave2025: 5,
      carriedOverBalance: 5,
      openingBalance: 5,
      mohLicenseNo: 'MOH-2024-114',
      mohLicenseExpiry: '2026-08-15',
      badgeId: '1009',
      biometricId: '1009',
      tags: ['أخصائي', 'منتهي الترخيص']
    },
    {
      id: 'emp-onboard-test',
      companyId,
      employeeCode: 'EMP-1010',
      fullNameAr: 'سليمان خالد الرشيدي',
      fullNameEn: 'Sulaiman Khaled Al-Rashidi',
      civilId: '298090101453',
      civilIdExpiry: '2029-09-01',
      passportNo: 'K009452',
      passportExpiry: '2032-09-01',
      nationality: 'كويتي',
      isKuwaiti: true,
      residencyType: 'كويتي',
      gender: 'MALE',
      dob: '1998-09-01',
      department: 'الإدارة',
      jobTitle: 'موظف استقبال وخدمة عملاء',
      email: 'sulaiman.rashidi@almanar.com',
      phone: '96590033442',
      joinDate: '2026-09-01',
      status: 'ONBOARDING',
      bankName: 'بنك بوبيان (Boubyan Bank)',
      iban: 'KW00BOUB000000000000101000',
      basicSalary: 450,
      contractSalary: 450,
      housingAllowance: 50,
      transportAllowance: 50,
      medicalAllowance: 0,
      otherAllowance: 0,
      totalSalary: 550,
      salary: 550,
      carriedOverLeave2025: 0,
      carriedOverBalance: 0,
      openingBalance: 0,
      badgeId: '1010',
      biometricId: '1010',
      tags: ['إداري', 'تهيئة']
    }
  ];
}

// -------------------------------------------------------------
// DATABASE API SERVICE (Multi-Tenant Persistence)
// -------------------------------------------------------------

export const TenantDatabaseService = {
  /**
   * Save or update an Employee to persistent database (Supabase + Firestore)
   */
  async saveEmployee(employee: Employee, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || employee.companyId || (employee as any).company_id || 'comp-super-admin';
    const row = toEmployeeDbRow({ ...employee, companyId: compId, company_id: compId } as Employee, compId);

    // 1. Dual write to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('employees').upsert([row], { onConflict: 'id' });
        if (error) {
          // Also try hr_employee table if employees table schema differs
          await supabase.from('hr_employee').upsert([{
            id: row.id,
            company_id: compId,
            name: row.full_name_ar,
            civil_id: row.civil_id,
            job_title: row.job_title,
            department: row.department,
            date_start: row.join_date,
            remaining_leaves: row.remaining_leaves,
            updated_at: row.updated_at
          }], { onConflict: 'id' });
        }
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase employee upsert fallback:', sbErr);
      }
    }

    // 2. Primary cloud persistence to Firestore
    try {
      const cleanDoc = cleanFirestoreData({
        ...employee,
        companyId: compId,
        company_id: compId,
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'employees', employee.id), cleanDoc, { merge: true });
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore save notice (quota/network):', fsErr);
    }

    // 3. Always persist to localStorage for instant UI reactivity and offline fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = `odoo_employees_v1_${compId}`;
        const raw = localStorage.getItem(key);
        let list: Employee[] = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        const idx = list.findIndex(e => e.id === employee.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...employee };
        } else {
          list.push(employee);
        }
        localStorage.setItem(key, JSON.stringify(list));
        localStorage.setItem('manara_employees_data', JSON.stringify(list));
      } catch (e) {}
    }

    return true;
  },

  /**
   * Fetch all employees for a specific tenant/company
   */
  async getEmployeesByTenant(companyId: string): Promise<Employee[]> {
    if (!companyId) return [];

    // 1. Try Supabase first if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('company_id', companyId);
        if (!error && Array.isArray(data) && data.length > 0) {
          const emps = data.map(fromEmployeeDbRow);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(`odoo_employees_v1_${companyId}`, JSON.stringify(emps));
          }
          return emps;
        }

        // Also check hr_employee table
        const { data: hrData, error: hrError } = await supabase
          .from('hr_employee')
          .select('*')
          .eq('company_id', companyId);
        if (!hrError && Array.isArray(hrData) && hrData.length > 0) {
          const emps = hrData.map(fromEmployeeDbRow);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(`odoo_employees_v1_${companyId}`, JSON.stringify(emps));
          }
          return emps;
        }
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase fetch error, fallback to Firestore:', sbErr);
      }
    }

    // 2. Firestore query by companyId with strict normalization
    try {
      const snap = await getDocs(collection(db, 'employees'));
      const allEmps: Employee[] = snap.docs.map(d => {
        const data = d.data();
        const resolvedCompId = data.companyId || data.company_id || 'comp-super-admin';
        return {
          ...data,
          id: d.id,
          companyId: resolvedCompId,
          company_id: resolvedCompId
        } as unknown as Employee;
      });

      const filtered = companyId === 'comp-super-admin'
        ? allEmps
        : allEmps.filter(emp => emp.companyId === companyId);

      // Successfully queried Firestore - update local storage to match cloud truth
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`odoo_employees_v1_${companyId}`, JSON.stringify(filtered));
        if (companyId === 'comp-super-admin' || companyId === 'comp-almanar') {
          localStorage.setItem('manara_employees_data', JSON.stringify(filtered));
        }
      }
      return filtered;
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore fetch error (falling back to local cache):', fsErr);
    }

    // 3. Fallback to LocalStorage cached data only if Firestore failed
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = localStorage.getItem(`odoo_employees_v1_${companyId}`);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Error reading employee cache:', err);
      }
    }

    // 4. If nothing in DB and nothing in cache, return empty list (never auto-seed test employees)
    return [];
  },

  /**
   * Delete an Employee from all persistent stores and purge all related records (contracts, leaves, commencements)
   */
  async deleteEmployee(employeeId: string, companyId?: string): Promise<boolean> {
    // 1. Supabase deletion (isolated safe execution)
    if (isSupabaseConfigured) {
      try {
        await supabase.from('employees').delete().eq('id', employeeId);
        await supabase.from('hr_employee').delete().eq('id', employeeId);
        await supabase.from('leaves').delete().eq('employee_id', employeeId);
        await supabase.from('contracts').delete().eq('employee_id', employeeId);
      } catch (sbErr) {
        console.warn('Supabase delete error:', sbErr);
      }
    }

    // 2. Firestore deletion of main employee document (isolated safe execution)
    try {
      await deleteDoc(doc(db, 'employees', employeeId));
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore delete employee notice:', fsErr);
    }

    // 3. Firestore deletion of related records (contracts, commencements, leaves, attendance, payslips)
    try {
      const relCols = ['contracts', 'commencements', 'leaves', 'attendance', 'payslips'];
      for (const colName of relCols) {
        try {
          const q = query(collection(db, colName), where('employeeId', '==', employeeId));
          const snap = await getDocs(q);
          await Promise.all(snap.docs.map(d => deleteDoc(doc(db, colName, d.id))));
        } catch (colErr) {}
      }
      await deleteDoc(doc(db, 'contracts', `contract-${employeeId}`)).catch(() => {});
      await deleteDoc(doc(db, 'commencements', `commencement-${employeeId}`)).catch(() => {});
    } catch (relErr) {
      console.warn('[TenantDatabaseService] Error purging related documents from Firestore:', relErr);
    }

    // 4. Guaranteed LocalStorage purge across all relevant keys
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToClean: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) keysToClean.push(k);
        }

        for (const key of keysToClean) {
          if (
            key.includes('odoo_contracts_') || 
            key.includes('odoo_commencements_') || 
            key.includes('odoo_leave_') || 
            key.includes('manara_leaves') || 
            key.includes('odoo_employees_') ||
            key.includes('manara_employees') ||
            key.includes('odoo_payroll_') ||
            key.includes('payroll') ||
            key.includes('payslip')
          ) {
            try {
              const raw = localStorage.getItem(key);
              if (raw && (raw.includes(employeeId) || raw.includes(`"${employeeId}"`))) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  const filtered = parsed.filter((item: any) => 
                    item.employeeId !== employeeId && 
                    item.id !== employeeId && 
                    item.employee_id !== employeeId && 
                    item.employeeName !== employeeId &&
                    !(typeof item.name === 'string' && item.name.includes(employeeId))
                  );
                  localStorage.setItem(key, JSON.stringify(filtered));
                } else if (parsed && typeof parsed === 'object') {
                  if (parsed.employeeId === employeeId || parsed.id === employeeId) {
                    localStorage.removeItem(key);
                  }
                }
              }
            } catch (kErr) {}
          }
        }
      } catch (storageErr) {
        console.warn('LocalStorage employee purge error:', storageErr);
      }

      // Notify other tabs and components immediately
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('manara_employees_updated'));
      } catch (evErr) {}
    }

    return true;
  },

  /**
   * Zero out all employees in Firestore and local storage without seeding any mock data
   */
  async clearAllEmployeesAndSeedOne(activeCompanyId: string = 'comp-almanar'): Promise<{ success: boolean; testEmployee: any; message: string }> {
    try {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('employees').delete().neq('id', 'non-existent');
          await supabase.from('hr_employee').delete().neq('id', 'non-existent');
        } catch {}
      }

      // 1. Delete all existing employee documents in Firestore
      const snap = await getDocs(collection(db, 'employees'));
      const batchDeletePromises = snap.docs.map(d => deleteDoc(doc(db, 'employees', d.id)));
      await Promise.all(batchDeletePromises);

      // 2. Clear local storage employee keys
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('odoo_employees_') || key.includes('employees_') || key.includes('hr_') || key.includes('clean_attendances') || key.includes('documents_')) {
            localStorage.removeItem(key);
          }
        });
      }

      return {
        success: true,
        testEmployee: null,
        message: 'تم تفريغ كافة البيانات القديمة بنجاح واعتماد السحابة فقط.'
      };
    } catch (err: any) {
      console.error('[TenantDatabaseService] Error clearing:', err);
      return {
        success: false,
        testEmployee: null,
        message: err.message || String(err)
      };
    }
  },

  /**
   * Save or update a Leave request in persistent database
   */
  async saveLeave(leave: LeaveRequest, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || leave.companyId || 'comp-super-admin';
    const row = toLeaveDbRow(leave, compId);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('leaves').upsert([row], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase leave upsert fallback:', sbErr);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData({ ...leave, companyId: compId, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, 'leaves', leave.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore leave save error:', fsErr);
      return false;
    }
  },

  /**
   * Fetch all leaves for a specific tenant/company
   */
  async getLeavesByTenant(companyId: string): Promise<LeaveRequest[]> {
    if (!companyId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leaves')
          .select('*')
          .eq('company_id', companyId);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(fromLeaveDbRow);
        }
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase leaves query error:', sbErr);
      }
    }

    try {
      const q = query(collection(db, 'leaves'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as LeaveRequest));
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore leaves query error:', fsErr);
      return [];
    }
  },

  /**
   * Save a Payroll Run / Archive
   */
  async savePayrollRun(payrollRun: PayrollRunRecord): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('payroll_runs').upsert([payrollRun], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase payroll run save fallback:', sbErr);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData(payrollRun);
      await setDoc(doc(db, 'payroll_runs', payrollRun.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore payroll run save error:', fsErr);
      return false;
    }
  },

  /**
   * Save a single Tenant / Company registration
   */
  async saveTenant(company: Company): Promise<boolean> {
    const row: TenantRecord = {
      id: company.id,
      name_ar: company.nameAr,
      name_en: company.nameEn,
      commercial_reg_no: company.commercialRegNo,
      civil_id_company: company.civilIdCompany,
      bank_name: company.bankName,
      iban: company.iban,
      wsi_code: company.wsiCode,
      currency: company.currency || 'KWD',
      status: company.status || 'active',
      email: company.email,
      phone: company.phone,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tenants').upsert([row], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase tenant upsert fallback:', sbErr);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData({ ...company, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), company.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore company save error:', fsErr);
      return false;
    }
  },

  /**
   * Save a Contract record
   */
  async saveContract(contract: Contract, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || contract.companyId || 'comp-super-admin';
    const effectiveDailyHours = contract.customDailyHours ?? contract.custom_daily_hours ?? contract.dailyWorkHours ?? contract.plannedDailyHours ?? 8;
    const effectiveWeeklyHours = contract.workingHoursPerWeek || (Number(effectiveDailyHours) * 6);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('contracts').upsert([{
          id: contract.id,
          company_id: compId,
          employee_id: contract.employeeId,
          basic_salary: contract.basicSalary,
          housing_allowance: contract.housingAllowance || 0,
          transport_allowance: contract.transportAllowance || 0,
          other_allowance: contract.otherAllowance || 0,
          start_date: contract.startDate,
          end_date: contract.endDate,
          contract_type: contract.contractType,
          status: contract.status,
          working_hours: effectiveDailyHours,
          custom_daily_hours: effectiveDailyHours,
          daily_work_hours: effectiveDailyHours,
          resource_calendar_id: contract.resourceCalendarId,
          working_schedule: contract.workingSchedule,
          work_hours_type: contract.workHoursType,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase contract upsert fallback:', sbErr);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData({
        ...contract,
        dailyWorkHours: effectiveDailyHours,
        customDailyHours: effectiveDailyHours,
        custom_daily_hours: effectiveDailyHours,
        plannedDailyHours: contract.plannedDailyHours ?? effectiveDailyHours,
        workingHoursPerWeek: effectiveWeeklyHours,
        companyId: compId,
        updatedAt: new Date().toISOString()
      });
      const docId = (contract.id || '').replace(/\//g, '_') || doc(collection(db, 'contracts')).id;
      await setDoc(doc(db, 'contracts', docId), cleanDoc, { merge: true });

      // تفعيل رصيد الإجازات السنوية التلقائي (30 يوماً لسنة 2026) عند سريان العقد (Running Trigger)
      if (contract.employeeId) {
        triggerContractRunningLeaveAllocation({
          employeeId: contract.employeeId,
          startDate: contract.startDate || '2026-01-01',
          status: contract.status,
          companyId: compId
        });
      }

      return true;
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, `contracts/${contract.id}`);
      return false;
    }
  },

  /**
   * Fetch all contracts for a specific tenant/company
   */
  async getContractsByTenant(companyId: string): Promise<Contract[]> {
    if (!companyId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('company_id', companyId);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(d => ({
            id: d.id,
            companyId: d.company_id || d.companyId,
            employeeId: d.employee_id || d.employeeId,
            basicSalary: d.basic_salary ?? d.basicSalary ?? 0,
            housingAllowance: d.housing_allowance ?? d.housingAllowance ?? 0,
            transportAllowance: d.transport_allowance ?? d.transportAllowance ?? 0,
            otherAllowance: d.other_allowance ?? d.otherAllowance ?? 0,
            startDate: d.start_date || d.startDate || '',
            endDate: d.end_date || d.endDate || '',
            contractType: d.contract_type || d.contractType || 'fixed',
            status: d.status || 'running',
            workingHours: d.working_hours || d.workingHours,
            customDailyHours: d.custom_daily_hours || d.customDailyHours,
            dailyWorkHours: d.daily_work_hours || d.dailyWorkHours,
            resourceCalendarId: d.resource_calendar_id || d.resourceCalendarId,
            workingSchedule: d.working_schedule || d.workingSchedule,
            workHoursType: d.work_hours_type || d.workHoursType,
          } as unknown as Contract));
        }
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase contracts query error:', sbErr);
      }
    }

    try {
      const q = query(collection(db, 'contracts'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const res = snap.docs.map(d => ({ ...d.data(), id: d.id } as Contract));
      if (res.length > 0) return res;
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore contracts query error:', fsErr);
    }

    // LocalStorage fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = localStorage.getItem(`odoo_contracts_v1_${companyId}`) || localStorage.getItem('manara_contracts_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }

    return [];
  },

  /**
   * Save an Attendance record
   */
  async saveAttendance(record: AttendanceRecord, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || record.companyId || 'comp-super-admin';
    if (isSupabaseConfigured) {
      const payload = {
        id: record.id,
        company_id: compId,
        employee_id: record.employeeId,
        date: record.date,
        check_in: record.checkIn,
        check_out: record.checkOut,
        work_hours: record.workHours,
        overtime_hours: record.overtimeHours,
        status: record.status,
        updated_at: new Date().toISOString()
      };
      try {
        await supabase.from('attendance').upsert([payload], { onConflict: 'id' });
      } catch (e) {}
      try {
        await supabase.from('hr_attendance').upsert([payload], { onConflict: 'id' });
      } catch (e) {}
      try {
        await supabase.from('attendance_logs').upsert([payload], { onConflict: 'id' });
      } catch (e) {}
    }

    try {
      const cleanDoc = cleanFirestoreData({ ...record, companyId: compId, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, 'attendance', record.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore attendance save error:', fsErr);
      return false;
    }
  },

  /**
   * Fetch Attendance records for tenant from Supabase/Firestore
   */
  async getAttendanceByTenant(companyId: string): Promise<AttendanceRecord[]> {
    if (!companyId) return [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('company_id', companyId);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(d => ({
            id: d.id,
            companyId: d.company_id,
            employeeId: d.employee_id,
            date: d.date,
            checkIn: d.check_in,
            checkOut: d.check_out,
            workHours: Number(d.work_hours || 0),
            overtimeHours: Number(d.overtime_hours || 0),
            status: d.status || 'حاضر'
          } as unknown as AttendanceRecord));
        }
      } catch (e) {
        console.warn('[TenantDatabaseService] Supabase attendance fetch error:', e);
      }
    }

    try {
      const q = query(collection(db, 'attendance'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord));
    } catch (e) {
      console.warn('[TenantDatabaseService] Firestore attendance fetch error:', e);
      return [];
    }
  },

  /**
   * Save a Document Item to Supabase & Firestore
   */
  async saveDocument(docItem: any, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || docItem.companyId || 'comp-super-admin';
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: docItem.id,
          company_id: compId,
          employee_id: docItem.employeeId || null,
          title: docItem.title || docItem.name || '',
          type: docItem.type || docItem.category || 'general',
          doc_number: docItem.docNumber || '',
          issue_date: docItem.issueDate || null,
          expiry_date: docItem.expiryDate || null,
          file_url: docItem.fileUrl || docItem.url || '',
          status: docItem.status || 'valid',
          updated_at: new Date().toISOString()
        };
        await supabase.from('documents').upsert([payload], { onConflict: 'id' });
      } catch (e) {
        console.warn('[TenantDatabaseService] Supabase document save fallback:', e);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData({ ...docItem, companyId: compId, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, 'documents', docItem.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore document save error:', fsErr);
      return false;
    }
  },

  /**
   * Fetch all documents for tenant from Supabase & Firestore
   */
  async getDocumentsByTenant(companyId: string): Promise<any[]> {
    if (!companyId) return [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('company_id', companyId);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(d => ({
            id: d.id,
            companyId: d.company_id,
            employeeId: d.employee_id,
            title: d.title,
            type: d.type,
            docNumber: d.doc_number,
            issueDate: d.issue_date,
            expiryDate: d.expiry_date,
            fileUrl: d.file_url,
            status: d.status
          }));
        }
      } catch (e) {
        console.warn('[TenantDatabaseService] Supabase documents fetch error:', e);
      }
    }

    try {
      const q = query(collection(db, 'documents'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e) {
      console.warn('[TenantDatabaseService] Firestore documents fetch error:', e);
      return [];
    }
  },

  /**
   * Delete a Document from Supabase and Firestore
   */
  async deleteDocument(docId: string, targetCompanyId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('documents').delete().eq('id', docId);
      } catch (e) {}
    }
    try {
      await deleteDoc(doc(db, 'documents', docId));
      return true;
    } catch (e) {
      console.error('[TenantDatabaseService] Firestore document delete error:', e);
      return false;
    }
  },

  /**
   * Save a Payslip record
   */
  async savePayslip(payslip: Payslip, targetCompanyId?: string): Promise<boolean> {
    const compId = targetCompanyId || payslip.companyId || 'comp-super-admin';
    if (isSupabaseConfigured) {
      try {
        await supabase.from('payslips').upsert([{
          id: payslip.id,
          company_id: compId,
          employee_id: payslip.employeeId,
          month: payslip.month,
          basic_salary: payslip.basicSalary,
          total_allowances: payslip.allowances || 0,
          gross_salary: payslip.grossSalary,
          total_deductions: (payslip.latenessDeduction || 0) + (payslip.loanDeduction || 0) + (payslip.unpaidLeaveDeduction || 0) + (payslip.otherDeductions || 0),
          net_salary: payslip.netSalary,
          status: payslip.paymentStatus || 'DRAFT',
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('[TenantDatabaseService] Supabase payslip upsert fallback:', sbErr);
      }
    }

    try {
      const cleanDoc = cleanFirestoreData({ ...payslip, companyId: compId, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, 'payslips', payslip.id), cleanDoc, { merge: true });
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore payslip save error:', fsErr);
      return false;
    }
  },

  /**
   * Clear all records in Firestore for a specific tenant and wipe localStorage
   */
  async clearAllDataForTenant(companyId: string): Promise<boolean> {
    const collectionsToClear = [
      'employees', 
      'contracts', 
      'commencements', 
      'attendance', 
      'leaves', 
      'leave_allocations',
      'payroll_runs', 
      'payslips',
      'documents',
      'loans',
      'settlements'
    ];
    try {
      for (const colName of collectionsToClear) {
        const q = query(collection(db, colName), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }
      
      // Also clear Supabase tables if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('employees').delete().eq('company_id', companyId);
          await supabase.from('contracts').delete().eq('company_id', companyId);
          await supabase.from('leaves').delete().eq('company_id', companyId);
          await supabase.from('attendance').delete().eq('company_id', companyId);
          await supabase.from('payslips').delete().eq('company_id', companyId);
          await supabase.from('documents').delete().eq('company_id', companyId);
        } catch (sbErr) {
          console.warn('[TenantDatabaseService] Supabase tenant wipe notice:', sbErr);
        }
      }

      // Remove specific cached keys for this company
      const prefix = `odoo_employees_v1_${companyId}`;
      localStorage.removeItem(prefix);
      localStorage.removeItem(`aysed_emp_cache_${companyId}`);
      return true;
    } catch (e) {
      console.error('Error clearing tenant data:', e);
      return false;
    }
  },

  /**
   * Wipe all demo/test data across all collections in Firestore, Supabase, and localStorage
   */
  async wipeEntireSystem(): Promise<boolean> {
    const collectionsToClear = [
      'employees', 
      'contracts', 
      'commencements', 
      'attendance', 
      'leaves', 
      'leave_allocations',
      'payroll_runs', 
      'payslips',
      'documents',
      'loans',
      'settlements'
    ];
    try {
      for (const colName of collectionsToClear) {
        try {
          const snap = await getDocs(collection(db, colName));
          const deletePromises = snap.docs.map(d => deleteDoc(doc(db, colName, d.id)).catch(err => console.warn(`Delete doc ${d.id} warning:`, err)));
          await Promise.all(deletePromises);
        } catch (colErr) {
          console.warn(`[TenantDatabaseService] Error wiping collection ${colName}:`, colErr);
        }
      }

      if (isSupabaseConfigured) {
        try {
          await supabase.from('employees').delete().neq('id', '___non_existent___');
          await supabase.from('contracts').delete().neq('id', '___non_existent___');
          await supabase.from('leaves').delete().neq('id', '___non_existent___');
          await supabase.from('attendance').delete().neq('id', '___non_existent___');
          await supabase.from('payslips').delete().neq('id', '___non_existent___');
          await supabase.from('documents').delete().neq('id', '___non_existent___');
        } catch (sbErr) {
          console.warn('[TenantDatabaseService] Supabase full wipe notice:', sbErr);
        }
      }

      // Preserve essential auth and company selection so UI doesn't crash
      const authSession = localStorage.getItem('aysed_hr_auth') || localStorage.getItem('aysed_token');
      const currentUser = localStorage.getItem('current_user') || localStorage.getItem('aysed_user');
      const devMode = localStorage.getItem('aysed_dev_mode') || localStorage.getItem('aysed_debug');
      const activeCompanyId = localStorage.getItem('activeCompanyId') || 'comp-almanar';

      // Clear all items in localStorage and sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Storage clear notice:', e);
      }

      if (authSession) {
        localStorage.setItem('aysed_hr_auth', authSession);
        localStorage.setItem('aysed_token', authSession);
      }
      if (currentUser) {
        localStorage.setItem('current_user', currentUser);
        localStorage.setItem('aysed_user', currentUser);
      }
      if (devMode) {
        localStorage.setItem('aysed_dev_mode', devMode);
        localStorage.setItem('aysed_debug', devMode);
      }
      if (activeCompanyId) {
        localStorage.setItem('activeCompanyId', activeCompanyId);
        localStorage.setItem(`odoo_employees_v1_${activeCompanyId}`, JSON.stringify([]));
        localStorage.setItem(`odoo_contracts_v1_${activeCompanyId}`, JSON.stringify([]));
        localStorage.setItem(`odoo_commencements_v1_${activeCompanyId}`, JSON.stringify([]));
      }
      localStorage.setItem('manara_employees_data', JSON.stringify([]));
      localStorage.setItem('manara_contracts_data', JSON.stringify([]));

      return true;
    } catch (e) {
      console.error('Error wiping entire system:', e);
      return false;
    }
  },

  /**
   * Seed 10 professional test employees with complete profiles, contracts, and test cases
   */
  async seedTenProfessionalTestEmployees(activeCompanyId: string = 'comp-almanar'): Promise<boolean> {
    try {
      const companyId = activeCompanyId || 'comp-almanar';

      // 10 Employee definitions
      const emps: Employee[] = [
        {
          id: 'emp-kwt-doc-old',
          companyId,
          employeeCode: 'EMP-1001',
          fullNameAr: 'أ.د. أحمد فيصل المطيري',
          fullNameEn: 'Prof. Ahmed Al-Mutairi',
          civilId: '280051201121',
          civilIdExpiry: '2029-05-12',
          passportNo: 'K009123',
          passportExpiry: '2031-01-01',
          nationality: 'كويتي',
          isKuwaiti: true,
          residencyType: 'كويتي',
          gender: 'MALE',
          dob: '1980-05-12',
          department: 'الأطباء',
          jobTitle: 'استشاري أول جراحة قلب وأوعية دموية',
          email: 'dr.ahmed.mutairi@almanar.com',
          phone: '96599001122',
          joinDate: '2024-01-01',
          status: 'ACTIVE',
          bankName: 'بيت التمويل الكويتي (KFH)',
          iban: 'KW99KFH000000000000100100',
          basicSalary: 3000,
          contractSalary: 3000,
          housingAllowance: 500,
          transportAllowance: 200,
          medicalAllowance: 300,
          otherAllowance: 0,
          totalSalary: 4000,
          salary: 4000,
          carriedOverLeave2025: 18,
          carriedOverBalance: 18,
          openingBalance: 18,
          badgeId: '1001',
          biometricId: '1001',
          tags: ['أخصائي', 'كويتي', 'كادر طبي']
        },
        {
          id: 'emp-exp-doc-old',
          companyId,
          employeeCode: 'EMP-1002',
          fullNameAr: 'د. سامح محمد الحسيني',
          fullNameEn: 'Dr. Sameh Al-Husseini',
          civilId: '285110401493',
          civilIdExpiry: '2028-11-04',
          passportNo: 'A1192834',
          passportExpiry: '2030-10-10',
          nationality: 'مصري',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'MALE',
          dob: '1985-11-04',
          department: 'الأطباء',
          jobTitle: 'أخصائي أمراض الباطنية والغدد الصم',
          email: 'dr.sameh@almanar.com',
          phone: '96590902233',
          joinDate: '2023-05-15',
          status: 'ACTIVE',
          bankName: 'بيت التمويل الكويتي (KFH)',
          iban: 'KW88KFH000000000000100200',
          basicSalary: 2200,
          contractSalary: 2200,
          housingAllowance: 300,
          transportAllowance: 100,
          medicalAllowance: 200,
          otherAllowance: 0,
          totalSalary: 2800,
          salary: 2800,
          carriedOverLeave2025: 12,
          carriedOverBalance: 12,
          openingBalance: 12,
          mohLicenseNo: 'MOH-2023-998',
          mohLicenseExpiry: '2027-12-31',
          badgeId: '1002',
          biometricId: '1002',
          tags: ['أخصائي', 'وافد', 'كادر طبي']
        },
        {
          id: 'emp-wps-exp-1',
          companyId,
          employeeCode: 'EMP-1003',
          fullNameAr: 'ماريا جريس سيلفا',
          fullNameEn: 'Maria Grace Silva',
          civilId: '292020512398',
          civilIdExpiry: '2027-02-05',
          passportNo: 'P990123A',
          passportExpiry: '2032-02-05',
          nationality: 'فلبيني',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'FEMALE',
          dob: '1992-02-05',
          department: 'التمريض',
          jobTitle: 'ممرض قانوني أول (General Nurse)',
          email: 'maria.silva@almanar.com',
          phone: '96560604455',
          joinDate: '2026-03-01',
          status: 'ACTIVE',
          bankName: 'بنك الخليج (Gulf Bank)',
          iban: 'KW77GULF000000000000100300',
          basicSalary: 650,
          contractSalary: 650,
          housingAllowance: 100,
          transportAllowance: 50,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 800,
          salary: 800,
          carriedOverLeave2025: 0,
          carriedOverBalance: 0,
          openingBalance: 0,
          mohLicenseNo: 'MOH-2026-112',
          mohLicenseExpiry: '2028-03-01',
          badgeId: '1003',
          biometricId: '1003',
          tags: ['ممرض', 'وافد']
        },
        {
          id: 'emp-kwt-admin-new',
          companyId,
          employeeCode: 'EMP-1004',
          fullNameAr: 'شريفة مساعد العازمي',
          fullNameEn: 'Shareefa Mosaed Al-Azmi',
          civilId: '295091201452',
          civilIdExpiry: '2029-09-12',
          passportNo: 'K008234',
          passportExpiry: '2031-09-12',
          nationality: 'كويتي',
          isKuwaiti: true,
          residencyType: 'كويتي',
          gender: 'FEMALE',
          dob: '1995-09-12',
          department: 'الإدارة',
          jobTitle: 'أخصائي شؤون موظفين وعلاقات عامة',
          email: 'shareefa.azmi@almanar.com',
          phone: '96594405566',
          joinDate: '2026-08-01',
          status: 'PROBATION',
          bankName: 'بنك الكويت الوطني (NBK)',
          iban: 'KW66NBK0000000000000100400',
          basicSalary: 950,
          contractSalary: 950,
          housingAllowance: 150,
          transportAllowance: 100,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 1200,
          salary: 1200,
          carriedOverLeave2025: 0,
          carriedOverBalance: 0,
          openingBalance: 0,
          badgeId: '1004',
          biometricId: '1004',
          tags: ['إداري', 'كويتي', 'تجربة']
        },
        {
          id: 'emp-probation-exp',
          companyId,
          employeeCode: 'EMP-1005',
          fullNameAr: 'راجيش كومار سينغ',
          fullNameEn: 'Rajesh Kumar Singh',
          civilId: '288071501982',
          civilIdExpiry: '2027-07-15',
          passportNo: 'Z009382',
          passportExpiry: '2029-07-15',
          nationality: 'هندي',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'MALE',
          dob: '1988-07-15',
          department: 'الخدمات المساندة',
          jobTitle: 'عامل صيانة ونظافة عامة',
          email: 'rajesh.kumar@almanar.com',
          phone: '96550506677',
          joinDate: '2026-08-15',
          status: 'PROBATION',
          bankName: 'بنك برقان (Burgan Bank)',
          iban: 'KW55BURG000000000000100500',
          basicSalary: 220,
          contractSalary: 220,
          housingAllowance: 50,
          transportAllowance: 30,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 300,
          salary: 300,
          carriedOverLeave2025: 0,
          carriedOverBalance: 0,
          openingBalance: 0,
          badgeId: '1005',
          biometricId: '1005',
          tags: ['عامل', 'تجربة']
        },
        {
          id: 'emp-unpaid-test',
          companyId,
          employeeCode: 'EMP-1006',
          fullNameAr: 'د. مصطفى خالد عثمان',
          fullNameEn: 'Dr. Mostafa Khaled Othman',
          civilId: '278061501192',
          civilIdExpiry: '2028-06-15',
          passportNo: 'E009213',
          passportExpiry: '2030-06-15',
          nationality: 'مصري',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'MALE',
          dob: '1978-06-15',
          department: 'الأطباء',
          jobTitle: 'أخصائي أول جراحة التجميل والترميم',
          email: 'dr.mostafa@almanar.com',
          phone: '96590012345',
          joinDate: '2025-06-01',
          status: 'ACTIVE',
          bankName: 'بيت التمويل الكويتي (KFH)',
          iban: 'KW44KFH000000000000100600',
          basicSalary: 1500,
          contractSalary: 1500,
          housingAllowance: 300,
          transportAllowance: 100,
          medicalAllowance: 100,
          otherAllowance: 0,
          totalSalary: 2000,
          salary: 2000,
          carriedOverLeave2025: 2,
          carriedOverBalance: 2,
          openingBalance: 2,
          badgeId: '1006',
          biometricId: '1006',
          tags: ['وافد', 'إجازة سارية', 'اختبار بدون راتب']
        },
        {
          id: 'emp-duty-test',
          companyId,
          employeeCode: 'EMP-1007',
          fullNameAr: 'ميرنا لوران سلفادور',
          fullNameEn: 'Myrna Lauren Salvador',
          civilId: '290011001492',
          civilIdExpiry: '2027-01-10',
          passportNo: 'P009871',
          passportExpiry: '2031-01-10',
          nationality: 'فلبيني',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'FEMALE',
          dob: '1990-01-10',
          department: 'التمريض',
          jobTitle: 'ممرض قانوني (Staff Nurse)',
          email: 'myrna.salvador@almanar.com',
          phone: '96560708899',
          joinDate: '2025-01-10',
          status: 'ACTIVE',
          bankName: 'بنك بوبيان (Boubyan Bank)',
          iban: 'KW33BOUB000000000000100700',
          basicSalary: 700,
          contractSalary: 700,
          housingAllowance: 100,
          transportAllowance: 50,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 850,
          salary: 850,
          carriedOverLeave2025: 4,
          carriedOverBalance: 4,
          openingBalance: 4,
          badgeId: '1007',
          biometricId: '1007',
          tags: ['ممرض', 'وافد', 'تكليف عطلة']
        },
        {
          id: 'emp-zero-leave-test',
          companyId,
          employeeCode: 'EMP-1008',
          fullNameAr: 'هالة طارق الفضلي',
          fullNameEn: 'Hala Tareq Al-Fadhli',
          civilId: '296010101984',
          civilIdExpiry: '2028-01-01',
          passportNo: 'K007123',
          passportExpiry: '2031-01-01',
          nationality: 'غير محدد الجنسية (بدون)',
          isKuwaiti: false,
          residencyType: 'معاملة كويتي',
          gender: 'FEMALE',
          dob: '1996-01-01',
          department: 'الإدارة',
          jobTitle: 'منسق تسويق وعلاقات مرضى',
          email: 'hala.fadhli@almanar.com',
          phone: '96590055443',
          joinDate: '2026-01-01',
          status: 'ACTIVE',
          bankName: 'بنك الكويت الوطني (NBK)',
          iban: 'KW22NBK000000000000100800',
          basicSalary: 500,
          contractSalary: 500,
          housingAllowance: 80,
          transportAllowance: 50,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 630,
          salary: 630,
          carriedOverLeave2025: 0,
          carriedOverBalance: 0,
          openingBalance: 0,
          badgeId: '1008',
          biometricId: '1008',
          tags: ['إداري', 'رصيد صفر']
        },
        {
          id: 'emp-exp-doc-alert',
          companyId,
          employeeCode: 'EMP-1009',
          fullNameAr: 'د. كمال عاطف البغدادي',
          fullNameEn: 'Dr. Kamal Al-Baghdadi',
          civilId: '281090101893',
          civilIdExpiry: '2026-08-15',
          passportNo: 'A009182',
          passportExpiry: '2028-09-01',
          nationality: 'سوري',
          isKuwaiti: false,
          residencyType: 'مادة 18 - قطاع أهلي',
          gender: 'MALE',
          dob: '1981-09-01',
          department: 'الأطباء',
          jobTitle: 'أخصائي تركيبات وزراعة الأسنان',
          email: 'dr.kamal@almanar.com',
          phone: '96590099887',
          joinDate: '2024-09-01',
          status: 'ACTIVE',
          bankName: 'بيت التمويل الكويتي (KFH)',
          iban: 'KW11KFH000000000000100900',
          basicSalary: 1600,
          contractSalary: 1600,
          housingAllowance: 200,
          transportAllowance: 100,
          medicalAllowance: 100,
          otherAllowance: 0,
          totalSalary: 2000,
          salary: 2000,
          carriedOverLeave2025: 5,
          carriedOverBalance: 5,
          openingBalance: 5,
          mohLicenseNo: 'MOH-2024-114',
          mohLicenseExpiry: '2026-08-15',
          badgeId: '1009',
          biometricId: '1009',
          tags: ['أخصائي', 'منتهي الترخيص']
        },
        {
          id: 'emp-onboard-test',
          companyId,
          employeeCode: 'EMP-1010',
          fullNameAr: 'سليمان خالد الرشيدي',
          fullNameEn: 'Sulaiman Khaled Al-Rashidi',
          civilId: '298090101453',
          civilIdExpiry: '2029-09-01',
          passportNo: 'K009452',
          passportExpiry: '2032-09-01',
          nationality: 'كويتي',
          isKuwaiti: true,
          residencyType: 'كويتي',
          gender: 'MALE',
          dob: '1998-09-01',
          department: 'الإدارة',
          jobTitle: 'موظف استقبال وخدمة عملاء',
          email: 'sulaiman.rashidi@almanar.com',
          phone: '96590033442',
          joinDate: '2026-09-01',
          status: 'ONBOARDING',
          bankName: 'بنك بوبيان (Boubyan Bank)',
          iban: 'KW00BOUB000000000000101000',
          basicSalary: 450,
          contractSalary: 450,
          housingAllowance: 50,
          transportAllowance: 50,
          medicalAllowance: 0,
          otherAllowance: 0,
          totalSalary: 550,
          salary: 550,
          carriedOverLeave2025: 0,
          carriedOverBalance: 0,
          openingBalance: 0,
          badgeId: '1010',
          biometricId: '1010',
          tags: ['إداري', 'تهيئة']
        }
      ];

      // 1. Immediately hydrate local storage so data is instantly active and never lost
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`odoo_employees_v1_${companyId}`, JSON.stringify(emps));
        localStorage.setItem('manara_employees_data', JSON.stringify(emps));
        localStorage.setItem('activeCompanyId', companyId);
      }

      // 2. Generate and store Contracts
      const contracts: Contract[] = emps.map(emp => ({
        id: 'contract-' + emp.id,
        companyId,
        employeeId: emp.id,
        basicSalary: emp.basicSalary || 500,
        housingAllowance: emp.housingAllowance || 0,
        transportAllowance: emp.transportAllowance || 0,
        otherAllowance: emp.otherAllowance || 0,
        startDate: emp.joinDate,
        endDate: emp.isKuwaiti ? '' : '2027-12-31',
        contractType: emp.isKuwaiti ? 'INDEFINITE' : 'FIXED_TERM',
        noticePeriodDays: 90,
        status: emp.status === 'ACTIVE' ? 'RUNNING' : 'DRAFT',
        plannedDailyHours: 8,
        workingHoursPerWeek: 48,
        dailyWorkHours: 8,
        workingSchedule: 'الدوام الصباحي القياسي 8 ساعات',
        workHoursType: 'STANDARD'
      }));

      // 3. Generate and store Commencements
      const commencements = emps.filter(emp => emp.status !== 'ONBOARDING').map(emp => ({
        id: 'commencement-' + emp.id,
        companyId,
        employeeId: emp.id,
        commencementDate: emp.joinDate,
        reportedDate: emp.joinDate,
        reportedBy: 'إدارة شؤون الموظفين',
        status: 'COMPLETED',
        isSigned: true,
        createdAt: new Date().toISOString()
      }));

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`odoo_contracts_v1_${companyId}`, JSON.stringify(contracts));
        localStorage.setItem('manara_contracts_data', JSON.stringify(contracts));
        localStorage.setItem(`odoo_commencements_v1_${companyId}`, JSON.stringify(commencements));
      }

      // 4. Save all employees & seed associated Contracts, Commencements to DB safely
      for (const emp of emps) {
        try {
          await this.saveEmployee(emp, companyId);
        } catch (e) {
          console.warn('[Seed] Firestore employee skipped:', e);
        }
      }

      for (const contract of contracts) {
        try {
          await this.saveContract(contract, companyId);
        } catch (e) {
          console.warn('[Seed] Firestore contract skipped:', e);
        }
      }

      for (const commencement of commencements) {
        try {
          await setDoc(doc(db, 'commencements', commencement.id), cleanFirestoreData(commencement), { merge: true });
        } catch (e) {
          console.warn('[Seed] Firestore commencement skipped:', e);
        }
      }

      // Seed approved leave exceeding balance for emp-6 (unpaid leave length of service test case) in Firestore
      const unpaidLeave: LeaveRequest = {
        id: 'leave-unpaid-test-01',
        companyId,
        employeeId: 'emp-unpaid-test',
        leaveType: 'ANNUAL',
        startDate: '2026-09-01',
        endDate: '2026-09-10', // 10 days
        totalDays: 10,
        status: 'APPROVED',
        reason: 'إجازة سنوية طارئة زائدة عن الرصيد للتحقق من الخصم من مدة الخدمة دون حسم الراتب',
        unpaidDays: 5.5,
        paidDays: 4.5,
        createdAt: new Date().toISOString()
      };
      await this.saveLeave(unpaidLeave, companyId);

      // Seed annual leave for Dr. Sameh Al-Husseini in Firestore
      const annualLeaveSameh: LeaveRequest = {
        id: 'leave-annual-samh',
        companyId,
        employeeId: 'emp-exp-doc-old',
        leaveType: 'ANNUAL',
        startDate: '2026-07-10',
        endDate: '2026-07-20',
        totalDays: 11,
        status: 'APPROVED',
        reason: 'إجازة زواج سنوية معتمدة مع تذاكر السفر مسبقاً',
        paidDays: 11,
        unpaidDays: 0,
        createdAt: new Date().toISOString()
      };
      await this.saveLeave(annualLeaveSameh, companyId);

      // Seed sick leave for Rajesh Kumar in Firestore
      const sickLeaveRajesh: LeaveRequest = {
        id: 'leave-sick-rajesh',
        companyId,
        employeeId: 'emp-probation-exp',
        leaveType: 'SICK',
        startDate: '2026-08-05',
        endDate: '2026-08-08',
        totalDays: 4,
        status: 'APPROVED',
        reason: 'إجازة مرضية بتقرير طبي معتمد من مستشفى المنار للرعاية الطبية',
        paidDays: 4,
        unpaidDays: 0,
        createdAt: new Date().toISOString()
      };
      await this.saveLeave(sickLeaveRajesh, companyId);

      // Seed Emergency leave for Hala Al-Fadhli in Firestore
      const emergLeaveHala: LeaveRequest = {
        id: 'leave-emerg-hala',
        companyId,
        employeeId: 'emp-zero-leave-test',
        leaveType: 'ANNUAL', // mapped to annual as per local code
        startDate: '2026-08-20',
        endDate: '2026-08-22',
        totalDays: 3,
        status: 'APPROVED',
        reason: 'إجازة طارئة لظروف عائلية حرجة وتخصم من الرصيد التراكمي',
        paidDays: 3,
        unpaidDays: 0,
        createdAt: new Date().toISOString()
      };
      await this.saveLeave(emergLeaveHala, companyId);

      // --- CLIENT-SIDE HYDRATION (LOCAL STORAGE SEEDING) ---
      // This ensures the custom UI modules (OdooPayrollApp, OdooTimeOffApp, OdooPublicHolidaysApp) reflect perfect data instantly.
      if (typeof window !== 'undefined' && window.localStorage) {
        // 1. Odoo Time Off (Leaves App) Requests Seeding
        const odooRequests = [
          {
            id: 'leave-unpaid-test-01',
            employeeId: 'emp-unpaid-test',
            employeeName: 'د. مصطفى خالد عثمان',
            civilId: '285091501144',
            department: 'الأطباء',
            leaveType: 'unpaid',
            startDate: '2026-09-01',
            endDate: '2026-09-10',
            daysCount: 10,
            reason: 'إجازة بدون راتب زائدة عن رصيد الإجازات السنوية',
            status: 'approved',
            appliedDate: '2026-08-25',
            basicSalary: 1500,
            totalSalary: 2000
          },
          {
            id: 'leave-annual-samh',
            employeeId: 'emp-exp-doc-old',
            employeeName: 'د. سامح محمد الحسيني',
            civilId: '276020501133',
            department: 'الأطباء',
            leaveType: 'annual',
            startDate: '2026-07-10',
            endDate: '2026-07-20',
            daysCount: 11,
            reason: 'إجازة زواج سنوية معتمدة مع تذاكر السفر مسبقاً',
            status: 'approved',
            appliedDate: '2026-06-30',
            basicSalary: 2000,
            totalSalary: 2800
          },
          {
            id: 'leave-sick-rajesh',
            employeeId: 'emp-probation-exp',
            employeeName: 'راجيش كومار سينغ',
            civilId: '289111201112',
            department: 'الصيانة والخدمات',
            leaveType: 'sick',
            startDate: '2026-08-05',
            endDate: '2026-08-08',
            daysCount: 4,
            reason: 'إجازة مرضية بتقرير طبي معتمد من مستشفى المنار للرعاية الطبية',
            status: 'approved',
            appliedDate: '2026-08-04',
            basicSalary: 350,
            totalSalary: 500
          },
          {
            id: 'leave-emerg-hala',
            employeeId: 'emp-zero-leave-test',
            employeeName: 'هالة طارق الفضلي',
            civilId: '293070401188',
            department: 'التسويق والمبيعات',
            leaveType: 'emergency',
            startDate: '2026-08-20',
            endDate: '2026-08-22',
            daysCount: 3,
            reason: 'إجازة طارئة لظروف عائلية حرجة وتخصم من الرصيد التراكمي',
            status: 'approved',
            appliedDate: '2026-08-19',
            basicSalary: 600,
            totalSalary: 850
          }
        ];
        localStorage.setItem('odoo_leave_requests_v2', JSON.stringify(odooRequests));

        // Save requests to Firestore so they are synced perfectly in real-time
        for (const req of odooRequests) {
          await setDoc(doc(db, 'leaves', req.id), cleanFirestoreData({ ...req, companyId }), { merge: true });
        }

        // 2. Odoo Time Off (Leaves App) Allocations Seeding
        const odooAllocations = [
          {
            id: 'alloc-ahmed-01',
            employeeId: 'emp-kwt-doc-old',
            employeeName: 'أ.د. أحمد فيصل المطيري',
            fromYear: '2026',
            days: 18,
            leaveType: 'annual',
            allocationDate: '2026-01-01',
            notes: 'رصيد افتتاحى مرحل معتمد من سنة 2025'
          },
          {
            id: 'alloc-samh-01',
            employeeId: 'emp-exp-doc-old',
            employeeName: 'د. سامح محمد الحسيني',
            fromYear: '2026',
            days: 30,
            leaveType: 'annual',
            allocationDate: '2026-01-01',
            notes: 'الرصيد السنوي المستحق لسنة 2026 وفق المادة 70'
          },
          {
            id: 'alloc-mustafa-01',
            employeeId: 'emp-unpaid-test',
            employeeName: 'د. مصطفى خالد عثمان',
            fromYear: '2026',
            days: 4.5,
            leaveType: 'annual',
            allocationDate: '2026-01-01',
            notes: 'الرصيد التراكمي الفعلي المعتمد في تاريخه'
          },
          {
            id: 'alloc-mirna-01',
            employeeId: 'emp-duty-test',
            employeeName: 'ميرنا لوران سلفادور',
            fromYear: '2026',
            days: 15,
            leaveType: 'annual',
            allocationDate: '2026-01-01',
            notes: 'رصيد الإجازات السنوية المستحقة قانونياً'
          },
          {
            id: 'alloc-mirna-02',
            employeeId: 'emp-duty-test',
            employeeName: 'ميرنا لوران سلفادور',
            fromYear: '2026',
            days: 1,
            leaveType: 'emergency',
            allocationDate: '2026-02-26',
            notes: 'يوم بديل معتمد للعمل في عطلة العيد الوطني الكويتي مادة 64'
          }
        ];
        localStorage.setItem('odoo_leave_allocations_v2', JSON.stringify(odooAllocations));

        // Save allocations to Firestore so they are synced perfectly in real-time
        for (const alloc of odooAllocations) {
          await setDoc(doc(db, 'leave_allocations', alloc.id), cleanFirestoreData({ ...alloc, companyId }), { merge: true });
        }

        // 3. Odoo Public Holidays Duties Seeding
        const odooDuties = [
          {
            id: 'duty-mirna-01',
            employeeId: 'emp-duty-test',
            employeeName: 'ميرنا لوران سلفادور',
            civilId: '294021201199',
            jobTitle: 'ممرضة جراحة وعناية مركزة',
            department: 'التمريض',
            holidayName: 'العيد الوطني الكويتي',
            dutyDate: '2026-02-25',
            basicSalary: 500,
            totalSalary: 850,
            compensationType: 'comp_day_off',
            calculatedAmount: 0,
            status: 'approved'
          }
        ];
        localStorage.setItem('odoo_holiday_duties_v2', JSON.stringify(odooDuties));

        // Save duties to Firestore so they are synced perfectly in real-time
        for (const duty of odooDuties) {
          await setDoc(doc(db, 'work_on_holidays', duty.id), cleanFirestoreData({ ...duty, companyId }), { merge: true });
        }

        // 4. Odoo Payroll App Payslips Seeding (August 2026 and September 2026)
        const odooPayslips = [
          // Prof. Ahmed Al-Mutairi
          {
            id: 'SLIP-2026-08-emp-kwt-doc-old',
            payslipNumber: 'PAY/2026/08/0001',
            employeeId: 'emp-kwt-doc-old',
            employeeName: 'أ.د. أحمد فيصل المطيري',
            civilId: '280051201121',
            jobTitle: 'استشاري أول جراحة قلب وأوعية دموية',
            department: 'الأطباء',
            bankName: 'بيت التمويل الكويتي (KFH)',
            iban: 'KW99KFH000000000000100100',
            period: '2026-08',
            basicSalary: 3000,
            housingAllowance: 500,
            transportAllowance: 200,
            medicalAllowance: 300,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 315, // 10.5% of 3000 Basic
            grossSalary: 4000,
            totalDeductions: 315,
            netSalary: 3685,
            status: 'confirmed',
            notes: 'مسير معتمد ومحسوب تلقائياً وفق قانون العمل الكويتي (اشتراك التأمينات الكويتيين PIFSS مسدد)'
          },
          {
            id: 'SLIP-2026-09-emp-kwt-doc-old',
            payslipNumber: 'PAY/2026/09/0001',
            employeeId: 'emp-kwt-doc-old',
            employeeName: 'أ.د. أحمد فيصل المطيري',
            civilId: '280051201121',
            jobTitle: 'استشاري أول جراحة قلب وأوعية دموية',
            department: 'الأطباء',
            bankName: 'بيت التمويل الكويتي (KFH)',
            iban: 'KW99KFH000000000000100100',
            period: '2026-09',
            basicSalary: 3000,
            housingAllowance: 500,
            transportAllowance: 200,
            medicalAllowance: 300,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 315,
            grossSalary: 4000,
            totalDeductions: 315,
            netSalary: 3685,
            status: 'draft',
            notes: 'مسير راتب سبتمبر مسودة قيد التدقيق'
          },
          // Sharifa Al-Azmi
          {
            id: 'SLIP-2026-08-emp-kwt-admin-new',
            payslipNumber: 'PAY/2026/08/0002',
            employeeId: 'emp-kwt-admin-new',
            employeeName: 'شريفة مساعد العازمي',
            civilId: '298101201144',
            jobTitle: 'أخصائي موارد بشرية أول وشؤون عاملين',
            department: 'الموارد البشرية',
            bankName: 'بنك الكويت الوطني (NBK)',
            iban: 'KW12NBKK000000000000100200',
            period: '2026-08',
            basicSalary: 800,
            housingAllowance: 200,
            transportAllowance: 100,
            medicalAllowance: 100,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 84, // 10.5% of 800 Basic
            grossSalary: 1200,
            totalDeductions: 84,
            netSalary: 1116,
            status: 'confirmed',
            notes: 'مسير معتمد ومحسوب تلقائياً وفق قانون العمل الكويتي (اشتراك التأمينات الكويتيين PIFSS مسدد)'
          },
          // Dr. Sameh Al-Husseini
          {
            id: 'SLIP-2026-08-emp-exp-doc-old',
            payslipNumber: 'PAY/2026/08/0003',
            employeeId: 'emp-exp-doc-old',
            employeeName: 'د. سامح محمد الحسيني',
            civilId: '276020501133',
            jobTitle: 'استشاري مشارك طب الأطفال وحديثي الولادة',
            department: 'الأطباء',
            bankName: 'بنك الخليج (Gulf Bank)',
            iban: 'KW55GULF000000000000100300',
            period: '2026-08',
            basicSalary: 2000,
            housingAllowance: 400,
            transportAllowance: 200,
            medicalAllowance: 200,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 2800,
            totalDeductions: 0,
            netSalary: 2800,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل وفق نموذج الـ WPS للوافدين'
          },
          // Dr. Kamal Al-Baghdadi
          {
            id: 'SLIP-2026-08-emp-exp-doc-alert',
            payslipNumber: 'PAY/2026/08/0004',
            employeeId: 'emp-exp-doc-alert',
            employeeName: 'د. كمال عاطف البغدادي',
            civilId: '281091501155',
            jobTitle: 'طبيب اختصاصي جراحة العظام والعمود الفقري',
            department: 'الأطباء',
            bankName: 'بنك الكويت الدولي (KIB)',
            iban: 'KW33KIBK000000000000100400',
            period: '2026-08',
            basicSalary: 1500,
            housingAllowance: 300,
            transportAllowance: 100,
            medicalAllowance: 100,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 2000,
            totalDeductions: 0,
            netSalary: 2000,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد (تنبيه: الترخيص الطبي والبطاقة المدنية منتهية الصلاحية!)'
          },
          // Dr. Mustafa Khaled (with 5.5 days unpaid leave deduction in September)
          {
            id: 'SLIP-2026-08-emp-unpaid-test',
            payslipNumber: 'PAY/2026/08/0005',
            employeeId: 'emp-unpaid-test',
            employeeName: 'د. مصطفى خالد عثمان',
            civilId: '285091501144',
            jobTitle: 'طبيب اختصاصي أنف وأذن وحنجرة',
            department: 'الأطباء',
            bankName: 'البنك التجاري الكويتي (CBK)',
            iban: 'KW44COMK000000000000100500',
            period: '2026-08',
            basicSalary: 1500,
            housingAllowance: 300,
            transportAllowance: 100,
            medicalAllowance: 100,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 2000,
            totalDeductions: 0,
            netSalary: 2000,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل'
          },
          {
            id: 'SLIP-2026-09-emp-unpaid-test',
            payslipNumber: 'PAY/2026/09/0005',
            employeeId: 'emp-unpaid-test',
            employeeName: 'د. مصطفى خالد عثمان',
            civilId: '285091501144',
            jobTitle: 'طبيب اختصاصي أنف وأذن وحنجرة',
            department: 'الأطباء',
            bankName: 'البنك التجاري الكويتي (CBK)',
            iban: 'KW44COMK000000000000100500',
            period: '2026-09',
            basicSalary: 1500,
            housingAllowance: 300,
            transportAllowance: 100,
            medicalAllowance: 100,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 5.5,
            absenceDeduction: 423.08, // 5.5 days * (2000 / 26)
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 2000,
            totalDeductions: 423.08,
            netSalary: 1576.92,
            status: 'review',
            notes: 'تم حسم 5.5 يوم إجازة بدون راتب لعدم كفاية الرصيد التراكمي في نظام الإجازات هرمياً'
          },
          // Mirna Salvador
          {
            id: 'SLIP-2026-08-emp-duty-test',
            payslipNumber: 'PAY/2026/08/0006',
            employeeId: 'emp-duty-test',
            employeeName: 'ميرنا لوران سلفادور',
            civilId: '294021201199',
            jobTitle: 'ممرضة جراحة وعناية مركزة',
            department: 'التمريض',
            bankName: 'بنك برقان (Burgan Bank)',
            iban: 'KW66BURG000000000000100600',
            period: '2026-08',
            basicSalary: 500,
            housingAllowance: 200,
            transportAllowance: 150,
            medicalAllowance: 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 850,
            totalDeductions: 0,
            netSalary: 850,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل'
          },
          // Hala Al-Fadhli
          {
            id: 'SLIP-2026-08-emp-zero-leave-test',
            payslipNumber: 'PAY/2026/08/0007',
            employeeId: 'emp-zero-leave-test',
            employeeName: 'هالة طارق الفضلي',
            civilId: '293070401188',
            jobTitle: 'منسق تسويق ومحتوى رقمي وأنشطة',
            department: 'التسويق والمبيعات',
            bankName: 'بنك الكويت الوطني (NBK)',
            iban: 'KW12NBKK000000000000100700',
            period: '2026-08',
            basicSalary: 600,
            housingAllowance: 150,
            transportAllowance: 100,
            medicalAllowance: 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 850,
            totalDeductions: 0,
            netSalary: 850,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل'
          },
          // Maria Silva
          {
            id: 'SLIP-2026-08-emp-wps-exp-1',
            payslipNumber: 'PAY/2026/08/0008',
            employeeId: 'emp-wps-exp-1',
            employeeName: 'ماريا جريس سيلفا',
            civilId: '288031201133',
            jobTitle: 'ممرضة أطفال عام ورعاية نهارية',
            department: 'التمريض',
            bankName: 'بنك الخليج (Gulf Bank)',
            iban: 'KW55GULF000000000000100800',
            period: '2026-08',
            basicSalary: 600,
            housingAllowance: 200,
            transportAllowance: 100,
            medicalAllowance: 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 900,
            totalDeductions: 0,
            netSalary: 900,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل'
          },
          // Rajesh Kumar
          {
            id: 'SLIP-2026-08-emp-probation-exp',
            payslipNumber: 'PAY/2026/08/0009',
            employeeId: 'emp-probation-exp',
            employeeName: 'راجيش كومار سينغ',
            civilId: '289111201112',
            jobTitle: 'فني صيانة معدات طبية وميكانيكا الكترونية',
            department: 'الصيانة والخدمات',
            bankName: 'بنك بوبيان (Boubyan Bank)',
            iban: 'KW00BOUB000000000000100900',
            period: '2026-08',
            basicSalary: 350,
            housingAllowance: 100,
            transportAllowance: 50,
            medicalAllowance: 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            delayMinutes: 0,
            delayDeduction: 0,
            loanDeduction: 0,
            pifssDeduction: 0,
            grossSalary: 500,
            totalDeductions: 0,
            netSalary: 500,
            status: 'confirmed',
            notes: 'مسير معتمد ومسدد بالكامل (الموظف تحت فترة التجربة 90 يوماً)'
          }
        ];
        localStorage.setItem(`odoo_payroll_payslips_${companyId}`, JSON.stringify(odooPayslips));
        localStorage.setItem('manara_payslips_data', JSON.stringify(odooPayslips));

        // Save payslips to Firestore so they are synced perfectly in real-time
        for (const slip of odooPayslips) {
          try {
            await setDoc(doc(db, 'payslips', slip.id), cleanFirestoreData({ ...slip, companyId }), { merge: true });
          } catch (e) {
            console.warn('[Seed] Firestore payslip notice:', e);
          }
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('manara_employees_updated'));
      }

      return true;
    } catch (e) {
      console.error('Error seeding 10 professional employees:', e);
      return false;
    }
  }
};

export async function addDirectEmployeeViaAi(tenantId: string, empData: any): Promise<Employee> {
  const companyId = tenantId || 'company_1';
  const newEmp: Employee = {
    id: 'emp_' + Date.now(),
    companyId: companyId,
    employeeCode: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    fullNameAr: empData.nameAr || 'موظف جديد',
    fullNameEn: empData.nameEn || empData.nameAr || 'New Employee',
    civilId: empData.civilId || '290' + Math.floor(100000000 + Math.random() * 900000000),
    civilIdExpiry: '2028-12-31',
    passportNo: 'P' + Math.floor(10000000 + Math.random() * 90000000),
    passportExpiry: '2030-12-31',
    nationality: empData.nationality || 'كويتي',
    isKuwaiti: (empData.nationality || '').includes('كويتي'),
    residencyType: 'مادة 18 - قطاع أهلي',
    gender: 'MALE',
    dob: '1990-01-01',
    department: empData.department || 'الإدارة العامة',
    jobTitle: empData.jobTitle || empData.job || 'موظف',
    email: empData.email || 'employee' + Math.floor(100 + Math.random() * 900) + '@company.com',
    phone: empData.phone || '96590000000',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    bankName: 'بيت التمويل الكويتي (KFH)',
    iban: 'KW12KFH000000000000112233',
    tags: ['الذكاء الاصطناعي'],
    notes: `مضاف عبر AI Copilot (الراتب: ${empData.basicSalary || empData.salary || 850} د.ك)`
  };
  await TenantDatabaseService.saveEmployee(newEmp, companyId);
  console.log('✅ [TenantDataService] Employee added directly via AI:', newEmp);
  return newEmp;
}

