/** Odoo-style employee import — stable keys + bilingual header labels for Excel template */

export interface EmployeeImportColumnDef {
  key: string;
  headerAr: string;
  headerEn: string;
  required?: boolean;
  example?: string;
}

export const EMPLOYEE_IMPORT_COLUMNS: EmployeeImportColumnDef[] = [
  { key: 'name_ar', headerAr: 'الاسم (عربي)', headerEn: 'Name (Arabic)', required: true, example: 'أحمد محمد العلي' },
  { key: 'name_en', headerAr: 'الاسم (إنجليزي)', headerEn: 'Name (English)', example: 'Ahmed Mohammed Al-Ali' },
  { key: 'civil_id', headerAr: 'الرقم المدني', headerEn: 'Civil ID', required: true, example: '285051234567' },
  { key: 'nationality', headerAr: 'الجنسية', headerEn: 'Nationality', example: 'مصر' },
  { key: 'birth_date', headerAr: 'تاريخ الميلاد', headerEn: 'Birth date', example: '1990-05-15' },
  { key: 'department', headerAr: 'القسم', headerEn: 'Department', example: 'الطوارئ' },
  { key: 'job_title', headerAr: 'المسمى الوظيفي', headerEn: 'Job title', example: 'ممرض' },
  { key: 'join_date', headerAr: 'تاريخ المباشرة الأصلي', headerEn: 'Original join date', required: true, example: '2018-03-01' },
  { key: 'residency_number', headerAr: 'رقم الإقامة', headerEn: 'Residency number', example: '123456789' },
  { key: 'residency_expiry', headerAr: 'تاريخ انتهاء الإقامة', headerEn: 'Residency expiry', example: '2027-06-30' },
  { key: 'moh_license', headerAr: 'ترخيص وزارة الصحة (MOH)', headerEn: 'MOH license', example: 'MOH-2024-001' },
  { key: 'moh_license_expiry', headerAr: 'انتهاء ترخيص MOH', headerEn: 'MOH license expiry', example: '2026-12-31' },
  { key: 'basic_salary', headerAr: 'الراتب الأساسي (د.ك)', headerEn: 'Basic salary (KWD)', example: '450' },
  { key: 'housing_allowance', headerAr: 'بدل السكن', headerEn: 'Housing allowance', example: '100' },
  { key: 'transport_allowance', headerAr: 'بدل المواصلات', headerEn: 'Transport allowance', example: '50' },
  { key: 'other_allowances', headerAr: 'بدلات أخرى', headerEn: 'Other allowances', example: '25' },
  { key: 'iban', headerAr: 'رقم الآيبان (IBAN)', headerEn: 'IBAN', example: 'KW81KFHO000000000000123456789012' },
  { key: 'bank_name', headerAr: 'اسم البنك', headerEn: 'Bank name', example: 'KFH' },
  { key: 'work_email', headerAr: 'البريد الوظيفي', headerEn: 'Work email', example: 'nurse1@clinic.kw' },
  { key: 'opening_annual_leave', headerAr: 'رصيد الإجازة السنوية الحالي', headerEn: 'Current annual leave balance', example: '12.5' },
  { key: 'carried_over_leave', headerAr: 'الرصيد المرحّل', headerEn: 'Carried-over leave balance', example: '5' },
];

export function buildHeaderAliasMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of EMPLOYEE_IMPORT_COLUMNS) {
    map[normalizeHeader(col.key)] = col.key;
    map[normalizeHeader(col.headerAr)] = col.key;
    map[normalizeHeader(col.headerEn)] = col.key;
  }
  return map;
}

function normalizeHeader(h: string): string {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');
}
