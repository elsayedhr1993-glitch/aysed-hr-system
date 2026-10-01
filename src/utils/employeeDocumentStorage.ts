import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

/** Firestore document max ~1 MiB; never persist large data: URLs in Firestore. */
export const FIRESTORE_INLINE_URL_MAX_CHARS = 900_000;

export function isInlineDataUrlTooLargeForFirestore(url: string): boolean {
  const s = String(url || '').trim();
  return s.startsWith('data:') && s.length > FIRESTORE_INLINE_URL_MAX_CHARS;
}

/** Never persist data: URLs on the employee Firestore doc (1 MiB limit + slow writes). */
export function sanitizeDocumentFileSlotForFirestore(
  slot: Record<string, unknown> | undefined | null
): Record<string, unknown> | undefined {
  if (!slot || typeof slot !== 'object') return undefined;
  const next: Record<string, unknown> = { ...slot };
  for (const key of ['url', 'fileUrl']) {
    const val = String(next[key] ?? '').trim();
    if (!val) continue;
    if (val.startsWith('data:') || isInlineDataUrlTooLargeForFirestore(val)) {
      delete next[key];
    }
  }
  if (!next.url && !next.fileUrl && !next.storagePath && !next.fileName && !next.name) {
    return undefined;
  }
  return next;
}

export function sanitizeEmployeeRecordForFirestore(employee: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...employee };
  const files = out.documentFiles as Record<string, Record<string, unknown>> | undefined;
  if (!files || typeof files !== 'object') return out;

  const cleaned: Record<string, unknown> = {};
  for (const [key, slot] of Object.entries(files)) {
    const normalized = sanitizeDocumentFileSlotForFirestore(slot);
    if (normalized) cleaned[key] = normalized;
  }
  out.documentFiles = cleaned;
  return out;
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
