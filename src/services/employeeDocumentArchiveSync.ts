import { setDoc, doc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import { checkDocumentExpiryStatus } from './documentService';
import { resolveEmployeeDisplayName } from '../utils/employeeDisplayName';

export const EMPLOYEE_ARCHIVE_SYNC_SLOTS = ['civilIdScan', 'residency', 'signedContract'] as const;
export type EmployeeArchiveSyncSlot = (typeof EMPLOYEE_ARCHIVE_SYNC_SLOTS)[number];

export type EmployeeArchiveDocumentPayload = {
  id: string;
  companyId: string;
  employeeId: string;
  title: string;
  category: string;
  documentNumber?: string;
  expiryDate: string;
  issueDate?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  status: string;
  sourceDocKey: EmployeeArchiveSyncSlot;
  syncSource: 'employee_profile';
  updatedAt: string;
};

function pickFirstNonEmpty(...values: unknown[]): string {
  for (const v of values) {
    const s = String(v ?? '').trim();
    if (s && s !== 'undefined' && s !== 'null') return s;
  }
  return '';
}

function normalizeDateOnly(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toISOString().slice(0, 10);
}

type SlotDef = {
  docKey: EmployeeArchiveSyncSlot;
  titleAr: string;
  category: string;
  expiry: (e: Record<string, unknown>) => string;
  docNumber: (e: Record<string, unknown>) => string;
  fileSlot: (e: Record<string, unknown>) => Record<string, unknown> | undefined;
};

const SLOT_DEFS: SlotDef[] = [
  {
    docKey: 'civilIdScan',
    titleAr: 'البطاقة المدنية',
    category: 'CIVIL_ID',
    expiry: (e) =>
      normalizeDateOnly(
        pickFirstNonEmpty(
          e.civilIdExpiry,
          e.civilIdExpiryDate,
          e.civil_id_expiry,
          (e.raw_payload as Record<string, unknown> | undefined)?.civilIdExpiry
        )
      ),
    docNumber: (e) => pickFirstNonEmpty(e.civilId, e.civil_id_number, e.civil_id),
    fileSlot: (e) => (e.documentFiles as Record<string, unknown> | undefined)?.civilIdScan as Record<string, unknown>,
  },
  {
    docKey: 'residency',
    titleAr: 'الإقامة / بطاقة المقيم',
    category: 'RESIDENCY',
    expiry: (e) =>
      normalizeDateOnly(
        pickFirstNonEmpty(
          e.residencyExpiry,
          e.residencyExpiryDate,
          e.iqamaExpiry,
          e.residenceExpiry
        )
      ),
    docNumber: (e) =>
      pickFirstNonEmpty(e.residencePermitNo, e.iqamaNo, e.residencyNumber, e.civilId),
    fileSlot: (e) => {
      const files = e.documentFiles as Record<string, unknown> | undefined;
      return (
        (files?.residencyScan as Record<string, unknown>) ||
        (files?.pamWorkPermit as Record<string, unknown>)
      );
    },
  },
  {
    docKey: 'signedContract',
    titleAr: 'عقد العمل (PAM)',
    category: 'WORK_CONTRACT',
    expiry: (e) =>
      normalizeDateOnly(
        pickFirstNonEmpty(
          e.contractEndDate,
          e.pamWorkPermitExpiryDate,
          e.pamPermitExpiry,
          e.contractExpiry
        )
      ),
    docNumber: (e) =>
      pickFirstNonEmpty(e.workPermitNo, e.pamWorkPermitNo, e.pamFileNumber),
    fileSlot: (e) => (e.documentFiles as Record<string, unknown> | undefined)?.signedContract as Record<string, unknown>,
  },
];

function slotHasSignal(def: SlotDef, employee: Record<string, unknown>): boolean {
  const expiry = def.expiry(employee);
  const num = def.docNumber(employee);
  const file = def.fileSlot(employee);
  const fileUrl = pickFirstNonEmpty(file?.url, file?.fileUrl);
  return Boolean(expiry || num || fileUrl);
}

/** Build central `documents` rows from employee profile (metadata + optional file slots). */
export function buildEmployeeArchiveDocuments(
  employee: Record<string, unknown>
): EmployeeArchiveDocumentPayload[] {
  const employeeId = pickFirstNonEmpty(employee.id);
  const companyId = pickFirstNonEmpty(employee.companyId, employee.company_id);
  if (!employeeId || !companyId) return [];

  const displayName = resolveEmployeeDisplayName(employee) || 'موظف';
  const today = new Date().toISOString().slice(0, 10);
  const out: EmployeeArchiveDocumentPayload[] = [];

  for (const def of SLOT_DEFS) {
    if (!slotHasSignal(def, employee)) continue;

    const file = def.fileSlot(employee);
    const fileUrl = pickFirstNonEmpty(file?.url, file?.fileUrl);
    const expiryDate = def.expiry(employee);
    const expiryStatus = checkDocumentExpiryStatus(expiryDate || undefined);

    const row: EmployeeArchiveDocumentPayload = {
      id: `${employeeId}-${def.docKey}`,
      companyId,
      employeeId,
      title: `${def.titleAr} — ${displayName}`,
      category: def.category,
      expiryDate,
      fileUrl,
      uploadDate: pickFirstNonEmpty(file?.uploadDate, today),
      status: expiryStatus.status,
      sourceDocKey: def.docKey,
      syncSource: 'employee_profile',
      updatedAt: new Date().toISOString(),
    };
    const docNumber = def.docNumber(employee);
    const issueDate = pickFirstNonEmpty(file?.issueDate, employee.hireDate, employee.joinDate);
    const fileName = pickFirstNonEmpty(file?.fileName, file?.name);
    const fileSize = pickFirstNonEmpty(file?.fileSize);
    if (docNumber) row.documentNumber = docNumber;
    if (issueDate) row.issueDate = issueDate;
    if (fileName) row.fileName = fileName;
    if (fileSize) row.fileSize = fileSize;
    out.push(row);
  }

  return out;
}

/** Upsert employee-derived rows into Firestore `documents` (client SDK). */
export async function syncEmployeeDocumentsToArchive(
  employee: Record<string, unknown>
): Promise<number> {
  const rows = buildEmployeeArchiveDocuments(employee);
  if (rows.length === 0) return 0;

  let written = 0;
  for (const row of rows) {
    await setDoc(doc(db, 'documents', row.id), cleanFirestoreData(row), { merge: true });
    written += 1;
  }
  return written;
}
