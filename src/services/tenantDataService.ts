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
    basic_salary: (emp as any).contractSalary || (emp as any).basicSalary || 0,
    carried_over_leave_2025: Number((emp as any).carriedOverLeave2025 ?? (emp as any).carriedOverBalance ?? (emp as any).openingBalance ?? 0),
    accrued_leave_2026: (emp as any).accruedLeave2026 || (emp as any).aysed_accrued_2026 || 0,
    remaining_leaves: emp.paid_days_remaining || 0,
    raw_payload: {
      ...emp,
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
      carriedOverLeave2025: Number(row.raw_payload.carriedOverLeave2025 ?? row.carried_over_leave_2025 ?? 0),
      carriedOverBalance: Number(row.raw_payload.carriedOverBalance ?? row.carried_over_leave_2025 ?? 0),
      openingBalance: Number(row.raw_payload.openingBalance ?? row.carried_over_leave_2025 ?? 0),
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
    carriedOverLeave2025: Number(row.carried_over_leave_2025 || 0),
    carriedOverBalance: Number(row.carried_over_leave_2025 || 0),
    openingBalance: Number(row.carried_over_leave_2025 || 0),
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
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Firestore save error:', fsErr);
      return false;
    }
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
          return data.map(fromEmployeeDbRow);
        }

        // Also check hr_employee table
        const { data: hrData, error: hrError } = await supabase
          .from('hr_employee')
          .select('*')
          .eq('company_id', companyId);
        if (!hrError && Array.isArray(hrData) && hrData.length > 0) {
          return hrData.map(fromEmployeeDbRow);
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

      if (companyId === 'comp-super-admin') {
        return allEmps;
      }
      return allEmps.filter(emp => emp.companyId === companyId);
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore fetch error:', fsErr);
      return [];
    }
  },

  /**
   * Delete an Employee from all persistent stores
   */
  async deleteEmployee(employeeId: string, companyId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('employees').delete().eq('id', employeeId);
        await supabase.from('hr_employee').delete().eq('id', employeeId);
      } catch {}
    }
    try {
      await deleteDoc(doc(db, 'employees', employeeId));
      return true;
    } catch (fsErr) {
      console.error('[TenantDatabaseService] Error deleting employee:', fsErr);
      return false;
    }
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
      await setDoc(doc(db, 'companies', company.id), cleanDoc, { merge: true });
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
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Contract));
    } catch (fsErr) {
      console.warn('[TenantDatabaseService] Firestore contracts query error:', fsErr);
      return [];
    }
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
    const collectionsToClear = ['employees', 'contracts', 'commencements', 'attendance', 'leaves', 'payroll_runs', 'payslips'];
    try {
      for (const colName of collectionsToClear) {
        const q = query(collection(db, colName), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing tenant data:', e);
      return false;
    }
  },

  /**
   * Wipe all demo/test data across all collections in Firestore and localStorage
   */
  async wipeEntireSystem(): Promise<boolean> {
    const collectionsToClear = ['employees', 'contracts', 'commencements', 'attendance', 'leaves', 'payroll_runs', 'payslips'];
    try {
      for (const colName of collectionsToClear) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error wiping entire system:', e);
      return false;
    }
  }
};

