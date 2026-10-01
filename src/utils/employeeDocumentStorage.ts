import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

/** Firestore document max ~1 MiB; never persist large data: URLs in Firestore. */
export const FIRESTORE_INLINE_URL_MAX_CHARS = 900_000;

export function isInlineDataUrlTooLargeForFirestore(url: string): boolean {
  const s = String(url || '').trim();
  return s.startsWith('data:') && s.length > FIRESTORE_INLINE_URL_MAX_CHARS;
}

export async function uploadEmployeeDocumentToStorage(params: {
  companyId: string;
  employeeId: string;
  docKey: string;
  file: File;
}): Promise<{ downloadUrl: string; storagePath: string }> {
  const { companyId, employeeId, docKey, file } = params;
  if (!companyId) throw new Error('معرّف الشركة غير متوفر لرفع المستند');
  if (!employeeId) throw new Error('معرّف الموظف غير متوفر لرفع المستند');

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `employee_documents/${companyId}/${employeeId}/${docKey}/${Date.now()}_${cleanName}`;
  const fileRef = storageRef(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      companyId,
      employeeId,
      docKey,
    },
  });

  const downloadUrl = await getDownloadURL(fileRef);
  return { downloadUrl, storagePath };
}
