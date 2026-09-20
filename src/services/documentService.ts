import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { mapEmployeeDocKeyToCategory } from '../utils/documentArchiveUtils';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeNameAr: string;
  civilId: string;
  companyId?: string;
  docKey?: string;

  category:
    | 'هويات وإقامات (Civil ID & Visa)'
    | 'تراخيص طبية (MOH Licenses)'
    | 'شهادات ومؤهلات علمية (Degrees & Certificates)'
    | 'عقود وإقرارات قانونية (Contracts & Declarations)'
    | 'فحوصات وبصمات (Medical & Security Clearances)';

  docTitleAr: string;
  docTitleEn: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  url?: string;
  title?: string;

  status: 'active' | 'expiring_soon' | 'expired';
  daysLeft?: number;
  notes?: string;
  uploadDate: string;
}

/** Persist to central `documents` collection (SSOT for archive + scanner). */
export async function saveEmployeeDocument(document: EmployeeDocument): Promise<void> {
  const docKey =
    document.docKey ||
    (document.id.includes('-') ? document.id.slice(document.id.indexOf('-') + 1) : 'OTHER');
  const companyId = document.companyId || '';
  if (!companyId) {
    throw new Error('companyId is required to archive employee documents');
  }

  const category = mapEmployeeDocKeyToCategory(docKey);
  const fileUrl = document.fileUrl || document.url || '';

  const centralPayload = {
    id: document.id,
    companyId,
    employeeId: document.employeeId,
    title: document.docTitleAr || document.title || document.fileName,
    category,
    fileUrl,
    fileName: document.fileName,
    fileSize: document.fileSize,
    uploadDate: document.uploadDate,
    expiryDate: document.expiryDate || '',
    issueDate: document.issueDate || '',
    documentNumber: document.documentNumber || document.civilId || '',
    status: 'active',
    sourceDocKey: docKey,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'documents', document.id), cleanFirestoreData(centralPayload), { merge: true });

  // Remove legacy duplicate if present
  try {
    await deleteDoc(doc(db, 'employee_documents', document.id));
  } catch {
    /* ignore */
  }
}

export async function deleteEmployeeDocument(documentId: string): Promise<void> {
  await deleteDoc(doc(db, 'documents', documentId));
  try {
    await deleteDoc(doc(db, 'employee_documents', documentId));
  } catch {
    /* ignore */
  }
}

export const checkDocumentExpiryStatus = (
  expiryDateStr?: string
): { status: 'active' | 'expiring_soon' | 'expired'; daysLeft?: number } => {
  if (!expiryDateStr) return { status: 'active' };

  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', daysLeft: diffDays };
  }
  if (diffDays <= 60) {
    return { status: 'expiring_soon', daysLeft: diffDays };
  }
  return { status: 'active', daysLeft: diffDays };
};
