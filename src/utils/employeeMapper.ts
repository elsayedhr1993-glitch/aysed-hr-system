import { Employee } from '../types';

export function normalizeEmployeeRecord(raw: Partial<Employee> & Record<string, any>, companyId?: string): Employee {
  const resolvedCompanyId = companyId || raw.companyId || raw.company_id || 'comp-super-admin';
  const basicSalary = Number(raw.basicSalary ?? raw.basic_salary ?? raw.contractSalary ?? raw.salary ?? 0);
  const housingAllowance = Number(raw.housingAllowance ?? raw.housing_allowance ?? 0);
  const transportAllowance = Number(raw.transportAllowance ?? raw.transport_allowance ?? 0);
  const medicalAllowance = Number(raw.medicalAllowance ?? raw.medical_allowance ?? 0);
  const otherAllowance = Number(raw.otherAllowance ?? raw.other_allowance ?? raw.otherAllowances ?? raw.other_allowances ?? 0);
  const fullNameAr = raw.fullNameAr || raw.full_name_ar || raw.nameAr || raw.name || 'موظف';
  const fullNameEn = raw.fullNameEn || raw.full_name_en || raw.nameEn || raw.name_en || '';
  const civilId = raw.civilId || raw.civil_id || raw.civil_id_number || '';

  return {
    ...raw,
    id: String(raw.id || ''),
    companyId: resolvedCompanyId,
    company_id: resolvedCompanyId,
    fullNameAr,
    full_name_ar: fullNameAr,
    fullNameEn,
    full_name_en: fullNameEn,
    name: fullNameAr,
    nameAr: fullNameAr,
    civilId,
    civil_id: civilId,
    civil_id_number: civilId,
    basicSalary,
    basic_salary: basicSalary,
    contractSalary: basicSalary,
    housingAllowance,
    housing_allowance: housingAllowance,
    transportAllowance,
    transport_allowance: transportAllowance,
    medicalAllowance,
    medical_allowance: medicalAllowance,
    otherAllowance,
    other_allowance: otherAllowance,
    totalSalary: Number(raw.totalSalary ?? raw.total_salary ?? basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance),
    status: raw.status || 'ACTIVE',
    joinDate: raw.joinDate || raw.join_date || '',
    department: raw.department || raw.dept || '',
    jobTitle: raw.jobTitle || raw.job_title || '',
    bankName: raw.bankName || raw.bank_name || '',
    iban: raw.iban || raw.bankIban || raw.bank_iban || '',
    tags: Array.isArray(raw.tags) ? raw.tags : []
  } as Employee;
}

export function toEmployeeFirestoreData(employee: Partial<Employee> & Record<string, any>, companyId?: string) {
  const normalized = normalizeEmployeeRecord(employee, companyId);
  return { ...normalized, updatedAt: new Date().toISOString() };
}