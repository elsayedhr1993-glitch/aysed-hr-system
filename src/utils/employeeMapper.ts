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
  const email = raw.email || raw.workEmail || raw.work_email || '';

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
    parentId:
      raw.parentId ||
      raw.managerId ||
      raw.reportsTo ||
      raw.directManagerId ||
      undefined,
    jobTitle: raw.jobTitle || raw.job_title || '',
    email,
    workEmail: email,
    bankName: raw.bankName || raw.bank_name || '',
    iban: raw.iban || raw.bankIban || raw.bank_iban || '',
    tags: Array.isArray(raw.tags) ? raw.tags : []
  } as Employee;
}

export function toEmployeeFirestoreData(employee: Partial<Employee> & Record<string, any>, companyId?: string) {
  const normalized = normalizeEmployeeRecord(employee, companyId);
  return { ...normalized, updatedAt: new Date().toISOString() };
}

/** UI view model for EmployeesApp (cards, detail, list). */
export function mapEmployeeForEmployeesAppView(
  emp: Partial<Employee> & Record<string, any>,
  companyId: string
) {
  const normalized = normalizeEmployeeRecord(emp, companyId);
  const civilExpiry =
    normalized.civilIdExpiry ||
    (emp as any).civilIdExpiryDate ||
    (emp as any).civil_id_expiry ||
    (emp as any).raw_payload?.civilIdExpiry ||
    (emp as any).raw_payload?.civilIdExpiryDate ||
    (emp as any).raw_payload?.civil_id_expiry ||
    '';
  const rawBasic = Number(normalized.basicSalary ?? 0);
  const rawHousing = Number(normalized.housingAllowance ?? 0);
  const rawTransport = Number(normalized.transportAllowance ?? 0);
  const rawMedical = Number(normalized.medicalAllowance ?? 0);
  const rawOther = Number(
    (emp as any).otherAllowances !== undefined ? (emp as any).otherAllowances : normalized.otherAllowance ?? 0
  );
  const rawAllowances = Number(
    (emp as any).allowances !== undefined && (emp as any).allowances !== 0
      ? (emp as any).allowances
      : rawHousing + rawTransport + rawMedical + rawOther
  );
  const rawTotal = Number(normalized.totalSalary || rawBasic + rawAllowances);

  return {
    ...normalized,
    id: normalized.id,
    companyId: normalized.companyId || companyId,
    company_id: normalized.companyId || companyId,
    nameAr: normalized.fullNameAr || (emp as any).nameAr || 'موظف',
    nameEn: normalized.fullNameEn || '',
    civilId: normalized.civilId || '',
    civilIdExpiry: civilExpiry,
    civilIdExpiryDate: civilExpiry,
    civil_id_expiry: civilExpiry,
    jobTitle: normalized.jobTitle || 'موظف',
    dept: normalized.department || (emp as any).dept || 'العموم',
    workLocation: (emp as any).workLocation || 'الفرع الرئيسي',
    manager: (emp as any).manager || '',
    phone: normalized.phone || '',
    email: normalized.email || '',
    nationality: normalized.nationality || 'كويتي',
    dob: normalized.dob || '',
    maritalStatus: (emp as any).maritalStatus || 'أعزب',
    dependents: (emp as any).dependents || 0,
    passportNo: normalized.passportNo || '',
    passportExpiry: normalized.passportExpiry || '',
    residencyType: (emp as any).residencyType || 'مواطن',
    hireDate: normalized.joinDate || (emp as any).hireDate || '',
    joinDate: normalized.joinDate || (emp as any).hireDate || '',
    mohLicense: normalized.mohLicenseNo || (emp as any).mohLicense || '',
    mohLicenseNo: normalized.mohLicenseNo || (emp as any).mohLicense || '',
    mohLicenseExpiry: normalized.mohLicenseExpiry || '',
    specialty: (emp as any).specialty || '',
    degree: (emp as any).degree || '',
    contractType: (emp as any).contractType || 'دائم',
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
    carriedOverLeave2025: Number(
      (emp as any).carriedOverLeave2025 ?? (emp as any).carriedOverBalance ?? 0
    ),
    carriedOverBalance: Number(
      (emp as any).carriedOverBalance ?? (emp as any).carriedOverLeave2025 ?? 0
    ),
    openingBalance: Number((emp as any).openingBalance ?? 0),
    status: normalized.status || 'ACTIVE',
    avatarColor: (emp as any).avatarColor || 'bg-purple-600',
    chatter: (emp as any).chatter || [],
  };
}