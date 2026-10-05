import type { Employee } from '../types';
import type { EmployeeDocument } from './documentService';
import { saveEmployeeDocument } from './documentService';
import { syncEmployeeDocumentsToArchive } from './employeeDocumentArchiveSync';
import { findEmployeesByCivilId } from './employeeDuplicateGuard';
import { TenantDatabaseService } from './tenantDataService';
import { findEmployeeForPamAudit } from '../lib/pamContractAudit';
import { employeeBelongsToTenant } from '../utils/contractTenantRules';
import { uploadEmployeeDocumentToStorage } from '../utils/employeeDocumentStorage';
import {
  handleOcrResult,
  processAnyDocument,
  type ScannedData,
} from '../utils/ocrService';

export type EmployeeDocumentIntakeHint =
  | 'CIVIL_ID'
  | 'PASSPORT'
  | 'WORK_PERMIT'
  | 'MEDICAL_LICENSE'
  | 'CONTRACT';

export const EMPLOYEE_DOC_SLOT_KEYS = [
  'civilIdScan',
  'passportScan',
  'pamWorkPermit',
  'mohLicense',
  'signedContract',
] as const;

export type EmployeeDocSlotKey = (typeof EMPLOYEE_DOC_SLOT_KEYS)[number];

type SlotMeta = {
  titleAr: string;
  titleEn: string;
  category: EmployeeDocument['category'];
  ocrHint: string;
  ocrNormalizedType: string;
};

const SLOT_META: Record<EmployeeDocSlotKey, SlotMeta> = {
  civilIdScan: {
    titleAr: 'البطاقة المدنية',
    titleEn: 'Civil ID',
    category: 'هويات وإقامات (Civil ID & Visa)',
    ocrHint: 'CIVIL_ID',
    ocrNormalizedType: 'civil_id',
  },
  passportScan: {
    titleAr: 'جواز السفر',
    titleEn: 'Passport',
    category: 'هويات وإقامات (Civil ID & Visa)',
    ocrHint: 'PASSPORT',
    ocrNormalizedType: 'passport',
  },
  pamWorkPermit: {
    titleAr: 'إذن العمل (PAM)',
    titleEn: 'Work Permit',
    category: 'عقود وإقرارات قانونية (Contracts & Declarations)',
    ocrHint: 'PAM_WORK_PERMIT',
    ocrNormalizedType: 'work_permit',
  },
  mohLicense: {
    titleAr: 'ترخيص وزارة الصحة',
    titleEn: 'MOH License',
    category: 'تراخيص طبية (MOH Licenses)',
    ocrHint: 'MEDICAL_LICENSE',
    ocrNormalizedType: 'medical_license',
  },
  signedContract: {
    titleAr: 'عقد العمل الموقع',
    titleEn: 'Signed Contract',
    category: 'عقود وإقرارات قانونية (Contracts & Declarations)',
    ocrHint: 'EMPLOYMENT_CONTRACT',
    ocrNormalizedType: 'contract',
  },
};

export function isAllowedEmployeeDocumentFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const isImage =
    file.type.startsWith('image/') || /(\.(png|jpg|jpeg|gif|bmp|webp|tif|tiff))$/i.test(fileName);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileName);
  return isImage || isPdf;
}

function hintToSlotKey(hint?: EmployeeDocumentIntakeHint): EmployeeDocSlotKey | undefined {
  switch (hint) {
    case 'CIVIL_ID':
      return 'civilIdScan';
    case 'PASSPORT':
      return 'passportScan';
    case 'WORK_PERMIT':
      return 'pamWorkPermit';
    case 'MEDICAL_LICENSE':
      return 'mohLicense';
    case 'CONTRACT':
      return 'signedContract';
    default:
      return undefined;
  }
}

function inferSlotKeyFromScan(scanned: ScannedData): EmployeeDocSlotKey {
  const dt = String(scanned.documentType || '').toLowerCase();
  if (dt.includes('passport')) return 'passportScan';
  if (dt.includes('license') || dt.includes('moh') || dt.includes('medical')) return 'mohLicense';
  if (dt.includes('permit') || dt.includes('work')) return 'pamWorkPermit';
  if (dt.includes('contract')) return 'signedContract';
  if (scanned.passportNo && !scanned.civilId) return 'passportScan';
  if (scanned.mohLicenseNo) return 'mohLicense';
  if (scanned.civilId) return 'civilIdScan';
  return 'civilIdScan';
}

export function resolveEmployeeDocSlotKey(
  hint?: EmployeeDocumentIntakeHint,
  scanned?: ScannedData
): EmployeeDocSlotKey {
  const fromHint = hintToSlotKey(hint);
  if (fromHint) return fromHint;
  if (scanned) return inferSlotKeyFromScan(scanned);
  return 'civilIdScan';
}

function normDigits(s: unknown): string {
  return String(s ?? '').replace(/\D/g, '');
}

function employeeDisplayName(emp: Record<string, unknown>): string {
  return String(
    emp.fullNameAr || emp.nameAr || emp.name || emp.fullNameEn || emp.nameEn || emp.id || 'موظف'
  );
}

export type EmployeeMatchResult =
  | {
      ok: true;
      employee: Record<string, unknown>;
      matchSource: 'screen_context' | 'civil_id' | 'name' | 'firestore_civil';
      civilIdWarning?: string;
    }
  | { ok: false; code: 'NOT_FOUND'; message: string }
  | {
      ok: false;
      code: 'AMBIGUOUS';
      message: string;
      candidates: { id: string; name: string; civilId?: string }[];
    };

export async function matchEmployeeForDocumentIntake(params: {
  companyId: string;
  employees: Employee[];
  preferredEmployeeId?: string;
  scanned?: ScannedData;
}): Promise<EmployeeMatchResult> {
  const { companyId, employees, preferredEmployeeId, scanned } = params;
  const scoped = employees.filter((e) => employeeBelongsToTenant(e, companyId));

  const ocrRecord = (scanned || {}) as Record<string, unknown>;
  const ocrCivil = normDigits(ocrRecord.civilId || ocrRecord.civil_id);

  if (preferredEmployeeId) {
    const hit = scoped.find((e) => String(e.id) === String(preferredEmployeeId));
    if (!hit) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'الموظف المفتوح في الشاشة غير موجود ضمن الشركة النشطة.',
      };
    }
    const rec = hit as Record<string, unknown>;
    let civilIdWarning: string | undefined;
    const empCivil = normDigits(rec.civilId || rec.civil_id);
    if (ocrCivil.length >= 8 && empCivil.length >= 8 && ocrCivil !== empCivil) {
      civilIdWarning = `تنبيه: الرقم المدني في المستند (${ocrCivil}) يختلف عن سجل الموظف (${empCivil}).`;
    }
    return { ok: true, employee: rec, matchSource: 'screen_context', civilIdWarning };
  }

  if (ocrCivil.length >= 8) {
    const localHit = scoped.find((e) => normDigits(e.civilId) === ocrCivil);
    if (localHit) {
      return {
        ok: true,
        employee: localHit as Record<string, unknown>,
        matchSource: 'civil_id',
      };
    }

    const remote = await findEmployeesByCivilId(ocrCivil);
    const inTenant = remote.filter((r) => r.companyId === companyId);
    if (inTenant.length === 1) {
      const fromList = scoped.find((e) => String(e.id) === inTenant[0].docId);
      const employee: Record<string, unknown> = fromList
        ? (fromList as Record<string, unknown>)
        : {
            id: inTenant[0].docId,
            companyId: inTenant[0].companyId,
            civilId: inTenant[0].civilId,
            fullNameAr: inTenant[0].fullNameAr,
          };
      return { ok: true, employee, matchSource: 'firestore_civil' };
    }
    if (inTenant.length > 1) {
      return {
        ok: false,
        code: 'AMBIGUOUS',
        message: 'عدة موظفين يطابقون الرقم المدني — افتح ملف الموظف الصحيح ثم أعد الرفع.',
        candidates: inTenant.map((r) => ({
          id: r.docId,
          name: r.fullNameAr,
          civilId: r.civilId,
        })),
      };
    }
  }

  const byName = findEmployeeForPamAudit(scoped, ocrRecord, companyId);
  if (byName) {
    return {
      ok: true,
      employee: byName as Record<string, unknown>,
      matchSource: 'name',
    };
  }

  return {
    ok: false,
    code: 'NOT_FOUND',
    message:
      'لم يُعرف الموظف. افتح ملف الموظف من دليل الموظفين، أو تأكد أن الرقم المدني/الاسم واضح في المستند.',
  };
}

export function buildEmployeeDocumentFileInfo(params: {
  employee: Record<string, unknown>;
  companyId: string;
  docKey: string;
  file: File;
  downloadUrl: string;
  storagePath: string;
  customTitle?: string;
}): Record<string, unknown> {
  const { employee, companyId, docKey, file, downloadUrl, storagePath, customTitle } = params;
  const employeeId = String(employee.id || '');
  const meta = SLOT_META[docKey as EmployeeDocSlotKey];
  const titleAr = customTitle || meta?.titleAr || docKey;
  const titleEn = meta?.titleEn || docKey;
  const category = meta?.category || 'عقود وإقرارات قانونية (Contracts & Declarations)';

  return {
    id: `${employeeId}-${docKey}`,
    employeeId,
    companyId,
    docKey,
    employeeNameAr: employeeDisplayName(employee),
    civilId: String(employee.civilId || employee.civil_id || ''),
    category,
    docTitleAr: titleAr,
    docTitleEn: titleEn,
    fileType: file.type.includes('pdf') ? 'PDF' : 'JPG',
    fileName: file.name,
    name: file.name,
    url: downloadUrl,
    fileUrl: downloadUrl,
    storagePath,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    uploadDate: new Date().toISOString().slice(0, 10),
    title: titleAr,
    type: file.type.includes('pdf') ? 'pdf' : 'image',
    status: 'verified',
  };
}

/** رفع ملف إلى Storage + أرشفة + حفظ سجل الموظف (بدون OCR). */
export async function uploadEmployeeDocumentSlot(params: {
  employee: Record<string, unknown>;
  companyId: string;
  docKey: string;
  file: File;
  customTitle?: string;
  mergeIntoEmployee?: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  const { employee, companyId, docKey, file, customTitle, mergeIntoEmployee } = params;
  const employeeId = String(employee.id || '');
  if (!companyId) throw new Error('معرّف الشركة غير متوفر لرفع المستند');
  if (!employeeId) throw new Error('معرّف الموظف غير متوفر لرفع المستند');
  if (!isAllowedEmployeeDocumentFile(file)) {
    throw new Error('يُسمح فقط بملفات الصور أو PDF.');
  }

  const { downloadUrl, storagePath } = await uploadEmployeeDocumentToStorage({
    companyId,
    employeeId,
    docKey,
    file,
  });

  const fileInfo = buildEmployeeDocumentFileInfo({
    employee,
    companyId,
    docKey,
    file,
    downloadUrl,
    storagePath,
    customTitle,
  });

  await saveEmployeeDocument(fileInfo as EmployeeDocument);

  const nextEmployee: Record<string, unknown> = {
    ...employee,
    ...mergeIntoEmployee,
    companyId: companyId || employee.companyId,
    documentFiles: {
      ...((employee.documentFiles as Record<string, unknown>) || {}),
      [docKey]: fileInfo,
    },
    ...(docKey === 'signedContract'
      ? { signedContractUrl: downloadUrl, contractSigned: true }
      : {}),
  };

  await TenantDatabaseService.saveEmployee(nextEmployee as Employee, companyId);
  await syncEmployeeDocumentsToArchive(nextEmployee).catch(() => undefined);

  return nextEmployee;
}

export type EmployeeDocumentIntakeSuccess = {
  ok: true;
  employeeId: string;
  employeeName: string;
  docKey: string;
  fileName: string;
  matchSource: string;
  civilIdWarning?: string;
};

export type EmployeeDocumentIntakeFailure = {
  ok: false;
  code: string;
  message: string;
  candidates?: { id: string; name: string; civilId?: string }[];
};

export type EmployeeDocumentIntakeResult =
  | EmployeeDocumentIntakeSuccess
  | EmployeeDocumentIntakeFailure;

/** OCR + مطابقة موظف + تحديث حقول + رفع وأرشفة. */
export async function runEmployeeDocumentIntake(params: {
  file: File;
  companyId: string;
  employees: Employee[];
  preferredEmployeeId?: string;
  hint?: EmployeeDocumentIntakeHint;
}): Promise<EmployeeDocumentIntakeResult> {
  const { file, companyId, employees, preferredEmployeeId, hint } = params;

  if (!companyId) {
    return { ok: false, code: 'NO_COMPANY', message: 'اختر شركة نشطة قبل رفع المستند.' };
  }
  if (!isAllowedEmployeeDocumentFile(file)) {
    return { ok: false, code: 'INVALID_FILE', message: 'يُسمح فقط بملفات الصور أو PDF.' };
  }

  const slotFromHint = hintToSlotKey(hint);
  const ocrHint = slotFromHint ? SLOT_META[slotFromHint].ocrHint : hint || 'CIVIL_ID';

  let scanned: ScannedData;
  try {
    scanned = await processAnyDocument(file, undefined, ocrHint);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل قراءة المستند (OCR).';
    return { ok: false, code: 'OCR_FAILED', message };
  }

  const docKey = resolveEmployeeDocSlotKey(hint, scanned);
  const ocrType = SLOT_META[docKey].ocrNormalizedType;

  const match = await matchEmployeeForDocumentIntake({
    companyId,
    employees,
    preferredEmployeeId,
    scanned,
  });

  if (!match.ok) {
    return {
      ok: false,
      code: match.code,
      message: match.message,
      candidates: match.code === 'AMBIGUOUS' ? match.candidates : undefined,
    };
  }

  let mergedEmployee: Record<string, unknown> = { ...match.employee };
  handleOcrResult(scanned, ocrType, (updater) => {
    mergedEmployee = updater(mergedEmployee);
  });

  try {
    await uploadEmployeeDocumentSlot({
      employee: match.employee,
      companyId,
      docKey,
      file,
      mergeIntoEmployee: mergedEmployee,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تعذر رفع المستند إلى التخزين.';
    return { ok: false, code: 'UPLOAD_FAILED', message };
  }

  return {
    ok: true,
    employeeId: String(mergedEmployee.id || match.employee.id),
    employeeName: employeeDisplayName(mergedEmployee),
    docKey,
    fileName: file.name,
    matchSource: match.matchSource,
    civilIdWarning: match.civilIdWarning,
  };
}
