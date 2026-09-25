import type { PamContractData } from '../services/pamContractPdfService';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function computeEmployeeTotalSalary(employee: Record<string, unknown> | null | undefined): number {
  if (!employee) return 0;
  const direct =
    Number(employee.totalSalary) ||
    Number(employee.salary) ||
    0;
  if (direct > 0) return direct;

  const basic = Number(employee.basicSalary || employee.basicWage || employee.wage || 0);
  const allowances =
    Number(employee.housingAllowance || 0) +
    Number(employee.transportAllowance || 0) +
    Number(employee.medicalAllowance || 0) +
    Number(employee.otherAllowance || employee.otherAllowances || employee.allowances || 0);

  return basic + allowances;
}

export function resolvePamCompanyId(
  employee: Record<string, unknown> | null | undefined,
  activeCompanyId: string,
  companyProp?: { id?: string } | null
): string {
  return String(
    employee?.companyId || activeCompanyId || companyProp?.id || ''
  ).trim();
}

export function nationalityEnFromAr(nationality: string): string {
  if (nationality === 'مصري') return 'Egyptian';
  if (nationality === 'كويتي') return 'Kuwaiti';
  if (nationality === 'هندي') return 'Indian';
  if (nationality === 'فلبيني') return 'Filipino';
  return nationality;
}

export function laborDeptEnFromAr(laborDept: string): string {
  if (laborDept === 'حولي') return 'Hawalli';
  if (laborDept === 'العاصمة') return 'Capital';
  if (laborDept === 'الفروانية') return 'Farwaniya';
  if (laborDept === 'الأحمدي') return 'Ahmadi';
  if (laborDept === 'الجهراء') return 'Jahra';
  if (laborDept === 'مبارك الكبير') return 'Mubarak Al-Kabeer';
  return laborDept;
}

export function buildPamFormDataFromSources(
  employee: Record<string, unknown> | null | undefined,
  company: Record<string, unknown> | null | undefined,
  todayDateStr: string
): PamContractData {
  const today = new Date();
  const todayDayAr = ARABIC_DAYS[today.getDay()];
  const todayDayEn = ENGLISH_DAYS[today.getDay()];

  const co = company || {};
  const compName = String(co.nameAr || co.name || '—');
  const compNameEn = String(co.nameEn || co.name || 'Clinic');
  const compRep = String(co.authorizedSignatory || co.managerName || co.ownerName || '—');
  const compRepEn = String(co.managerNameEn || co.ownerNameEn || '');
  const compRepCivil = String(co.signatoryCivilId || co.civilIdCompany || '');
  const compField = String(
    co.commercialActivity || co.activity || 'الرعاية والخدمات الطبية والصحية'
  );
  const compFieldEn = String(co.activityEn || 'Healthcare & Medical Services');
  const laborDept = String(co.laborDepartment || 'حولي');

  const emp = employee || {};
  const empNameAr = String(emp.name || emp.fullNameAr || emp.fullName || emp.nameAr || '');
  const empNameEn = String(emp.nameEn || emp.fullNameEn || '');
  const empNationality = String(emp.nationality || 'مصري');
  const empCivil = String(emp.civilId || emp.civil_id_number || '');
  const residencyRaw = String(emp.residencyType || emp.residencyArticle || 'مادة 18 - قطاع أهلي');
  const empResidence = emp.address ? `${residencyRaw} - ${emp.address}` : residencyRaw;
  const empResidenceEn = String(emp.residenceEn || residencyRaw);
  const empJobAr = String(emp.jobTitle || emp.position || emp.dept || emp.department || '—');
  const empJobEn = String(emp.jobTitleEn || emp.jobTitle || '');
  const totalSalary = computeEmployeeTotalSalary(emp);
  const empSalary = String(
    totalSalary > 0 ? totalSalary : emp.basicWage || emp.wage || '0'
  );
  const rawHire =
    emp.hireDate || emp.joiningDate || emp.joinDate || emp.startDate || emp.contractStartDate;
  const empHireDate = rawHire ? String(rawHire).replace(/-/g, '/') : todayDateStr;

  return {
    companyLaborDept: laborDept,
    companyLaborDeptEn: laborDeptEnFromAr(laborDept),
    contractDay: todayDayAr,
    contractDayEn: todayDayEn,
    contractDate: todayDateStr,

    companyName: compName,
    companyNameEn: compNameEn,
    companyRepName: compRep,
    companyRepNameEn: compRepEn,
    companyRepCivilId: compRepCivil,
    companyField: compField,
    companyFieldEn: compFieldEn,

    employeeNameAr: empNameAr,
    employeeNameEn: empNameEn,
    employeeNationality: empNationality,
    employeeNationalityEn: nationalityEnFromAr(empNationality),
    employeeCivilId: empCivil,
    employeeResidence: empResidence,
    employeeResidenceEn: empResidenceEn,

    jobTitleAr: empJobAr,
    jobTitleEn: empJobEn,
    basicSalary: empSalary,
    salaryPeriod: 'نهاية كل شهر',
    salaryPeriodEn: 'End of each calendar month',

    effectiveDate: empHireDate,
    durationYears: '3',
    leaveDay: '30',
    leaveDayEn: '30 days (annual leave per Kuwait Private Sector Labor Law)',
    contractLanguageAr: 'باللغتين العربية والإنجليزية',
    contractLanguageEn: 'Arabic and English',
  };
}
