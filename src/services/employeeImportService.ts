import * as XLSX from 'xlsx';
import { doc, writeBatch } from 'firebase/firestore';
import type { Employee } from '../types';
import { db, cleanFirestoreData } from '../lib/firebase';
import {
  EMPLOYEE_IMPORT_COLUMNS,
  buildHeaderAliasMap,
} from '../config/employeeImportColumns';
import {
  buildEmployeeOnboardingBundle,
  type EmployeeOnboardingInput,
} from './employeeOnboardingService';
import { toEmployeeFirestoreData } from '../utils/employeeMapper';
import { validateKuwaitCivilId } from '../utils/kuwaitLaw';

export interface ParsedEmployeeImportRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface EmployeeImportRowResult {
  rowNumber: number;
  success: boolean;
  employeeId?: string;
  name?: string;
  error?: string;
}

export interface EmployeeImportSummary {
  total: number;
  success: number;
  failed: number;
  results: EmployeeImportRowResult[];
}

function normalizeDateCell(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && XLSX.SSF) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

function cellToString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

export function parseEmployeeImportWorkbook(buffer: ArrayBuffer): ParsedEmployeeImportRow[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames.find((n) => /employee|موظف/i.test(n)) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }) as unknown[][];

  if (!matrix.length) return [];

  const alias = buildHeaderAliasMap();
  const headerRow = (matrix[0] || []).map((h) => cellToString(h));
  const keyIndexes: Record<string, number> = {};
  headerRow.forEach((label, idx) => {
    const key = alias[normalizeHeaderKey(label)];
    if (key) keyIndexes[key] = idx;
  });

  const rows: ParsedEmployeeImportRow[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i] || [];
    if (!line.some((c) => cellToString(c))) continue;
    const values: Record<string, string> = {};
    for (const col of EMPLOYEE_IMPORT_COLUMNS) {
      const idx = keyIndexes[col.key];
      if (idx === undefined) continue;
      const raw = line[idx];
      if (col.key.includes('date') || col.key.includes('expiry') || col.key === 'join_date') {
        values[col.key] = normalizeDateCell(raw);
      } else {
        values[col.key] = cellToString(raw);
      }
    }
    if (!values.name_ar && !values.civil_id) continue;
    rows.push({ rowNumber: i + 1, values });
  }
  return rows;
}

function normalizeHeaderKey(h: string): string {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');
}

export function rowToEmployeeDraft(
  row: ParsedEmployeeImportRow,
  companyId: string
): Partial<Employee> & Record<string, unknown> {
  const v = row.values;
  const civilId = String(v.civil_id || '').replace(/\D/g, '');
  const joinDate = v.join_date || new Date().toISOString().slice(0, 10);
  const basic = Number(v.basic_salary) || 0;
  const housing = Number(v.housing_allowance) || 0;
  const transport = Number(v.transport_allowance) || 0;
  const other = Number(v.other_allowances) || 0;
  const openingAnnual = Number(v.opening_annual_leave) || 0;
  const carried = Number(v.carried_over_leave) || 0;

  return {
    id: `EMP-IMP-${civilId || Date.now().toString(36)}`,
    companyId,
    civilId,
    fullNameAr: v.name_ar,
    nameAr: v.name_ar,
    fullNameEn: v.name_en,
    nameEn: v.name_en,
    nationality: v.nationality,
    dateOfBirth: v.birth_date,
    birthDate: v.birth_date,
    department: v.department,
    dept: v.department,
    jobTitle: v.job_title,
    joinDate,
    hireDate: joinDate,
    commencementDate: joinDate,
    contractStartDate: joinDate,
    residencyNumber: v.residency_number,
    residencyExpiry: v.residency_expiry,
    civilIdExpiry: v.residency_expiry,
    civilIdExpiryDate: v.residency_expiry,
    mohLicense: v.moh_license,
    mohLicenseNo: v.moh_license,
    mohLicenseExpiry: v.moh_license_expiry,
    basicSalary: basic,
    housingAllowance: housing,
    transportAllowance: transport,
    otherAllowances: other,
    otherAllowance: other,
    allowances: housing + transport + other,
    totalSalary: basic + housing + transport + other,
    salary: basic + housing + transport + other,
    iban: v.iban,
    bankName: v.bank_name || 'KFH',
    email: v.work_email,
    workEmail: v.work_email,
    openingBalance: openingAnnual + carried,
    annualLeaveBalance: openingAnnual,
    carriedOverLeave2025: carried,
    carriedOverBalance: carried,
    isCommenced: true,
    status: 'ACTIVE',
    contractStatus: 'running',
    leaveAccrualActivated: true,
    tags: ['استيراد جماعي'],
  };
}

function validateImportRow(row: ParsedEmployeeImportRow): string | null {
  const v = row.values;
  if (!v.name_ar?.trim()) return 'الاسم العربي مطلوب';
  if (!v.civil_id?.trim()) return 'الرقم المدني مطلوب';
  const civil = String(v.civil_id).replace(/\D/g, '');
  const civilCheck = validateKuwaitCivilId(civil);
  if (!civilCheck.isValid) return civilCheck.message || 'الرقم المدني غير صالح';
  if (!v.join_date?.trim()) return 'تاريخ المباشرة الأصلي مطلوب';
  return null;
}

async function persistImportBundle(
  input: EmployeeOnboardingInput,
  openingAllocationDays: number
): Promise<string> {
  const bundle = buildEmployeeOnboardingBundle(input);
  const batch = writeBatch(db);

  batch.set(
    doc(db, 'employees', String(bundle.employee.id)),
    cleanFirestoreData(toEmployeeFirestoreData(bundle.employee, bundle.employee.companyId)),
    { merge: true }
  );
  batch.set(doc(db, 'contracts', String(bundle.contract.id)), cleanFirestoreData(bundle.contract), {
    merge: true,
  });
  batch.set(
    doc(db, 'commencements', String(bundle.commencement.id)),
    cleanFirestoreData(bundle.commencement),
    { merge: true }
  );

  const openingTotal = openingAllocationDays;
  if (openingTotal > 0) {
    const allocationId = `ALLOC-${input.companyId}-${bundle.employee.id}-opening-import`;
    batch.set(
      doc(db, 'leave_allocations', allocationId),
      cleanFirestoreData({
        id: allocationId,
        employeeId: bundle.employee.id,
        companyId: input.companyId,
        leaveType: 'ANNUAL',
        allocationType: 'regular',
        numberOfDays: openingTotal,
        consumedDays: 0,
        encashedDays: 0,
        remainingDays: openingTotal,
        dateFrom: `${new Date().getFullYear()}-01-01`,
        state: 'validate',
        name: 'رصيد افتتاحي — استيراد الموظفين',
        notes: 'Employee bulk import opening balance',
        createdAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } else if (bundle.leaveAllocation) {
    batch.set(
      doc(db, 'leave_allocations', String(bundle.leaveAllocation.id)),
      cleanFirestoreData(bundle.leaveAllocation),
      { merge: true }
    );
  }

  await batch.commit();
  return String(bundle.employee.id);
}

export async function importEmployeesBatch(
  rows: ParsedEmployeeImportRow[],
  companyId: string,
  existingEmployees: Array<Partial<Employee> & Record<string, unknown>>
): Promise<EmployeeImportSummary> {
  const results: EmployeeImportRowResult[] = [];

  for (const row of rows) {
    const validationError = validateImportRow(row);
    if (validationError) {
      results.push({ rowNumber: row.rowNumber, success: false, error: validationError });
      continue;
    }

    try {
      const draft = rowToEmployeeDraft(row, companyId);
      const opening =
        Number(row.values.opening_annual_leave || 0) + Number(row.values.carried_over_leave || 0);

      const employeeId = await persistImportBundle(
        {
          companyId,
          existingEmployees: existingEmployees as Employee[],
          employee: draft,
          importMode: true,
        },
        opening
      );

      existingEmployees.push({ ...draft, id: employeeId } as Employee);
      results.push({
        rowNumber: row.rowNumber,
        success: true,
        employeeId,
        name: row.values.name_ar,
      });
    } catch (e) {
      results.push({
        rowNumber: row.rowNumber,
        success: false,
        name: row.values.name_ar,
        error: e instanceof Error ? e.message : 'فشل الحفظ',
      });
    }
  }

  const success = results.filter((r) => r.success).length;
  return {
    total: rows.length,
    success,
    failed: rows.length - success,
    results,
  };
}

export function downloadEmployeeImportTemplate(): void {
  const headerRow = EMPLOYEE_IMPORT_COLUMNS.map((c) => `${c.headerAr} / ${c.headerEn}`);
  const exampleRow = EMPLOYEE_IMPORT_COLUMNS.map((c) => c.example || '');
  const requiredNote = EMPLOYEE_IMPORT_COLUMNS.map((c) => (c.required ? '*' : ''));

  const ws = XLSX.utils.aoa_to_sheet([headerRow, requiredNote, exampleRow]);
  ws['!cols'] = EMPLOYEE_IMPORT_COLUMNS.map(() => ({ wch: 22 }));

  const guide = XLSX.utils.aoa_to_sheet([
    ['Aysed HR — Employee Import (Odoo 18 style)'],
    [''],
    ['• الصف الأول: عناوين الأعمدة (عربي / English)'],
    ['• الصف الثاني: * = حقل إلزامي'],
    ['• الصف الثالث: مثال — احذفه قبل الاستيراد أو استبدله ببياناتكم'],
    ['• تاريخ المباشرة الأصلي يُستخدم تلقائياً في EOS ومكافأة نهاية الخدمة'],
    [''],
    ['Employees sheet name: Employees or موظفين'],
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.utils.book_append_sheet(wb, guide, 'Instructions');
  XLSX.writeFile(wb, `Aysed_Employee_Import_Template_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
