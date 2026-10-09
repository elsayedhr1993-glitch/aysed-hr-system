import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

const ALLOWED_EXT = /\.(pdf|png|jpe?g)$/i;

export function validateGovernmentLicenseAttachment(file: File): string | null {
  if (!file) return 'لم يتم اختيار ملف';
  if (file.size > MAX_BYTES) return 'حجم الملف يتجاوز 25 ميجابايت';
  const mime = (file.type || '').toLowerCase();
  const nameOk = ALLOWED_EXT.test(file.name);
  const mimeOk = !mime || ALLOWED_MIME.has(mime);
  if (!nameOk && !mimeOk) {
    return 'الصيغ المسموحة: PDF، PNG، JPG';
  }
  return null;
}

export async function uploadGovernmentLicenseAttachmentToStorage(params: {
  companyId: string;
  departmentId: string;
  folderId: string;
  documentNumber: string;
  file: File;
}): Promise<{ downloadUrl: string; storagePath: string }> {
  const { companyId, departmentId, folderId, documentNumber, file } = params;
  const validationError = validateGovernmentLicenseAttachment(file);
  if (validationError) throw new Error(validationError);
  if (!companyId) throw new Error('معرّف الشركة غير متوفر لرفع المرفق');

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const docSlug = String(documentNumber || 'license').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 48);
  const storagePath = `company_documents/${companyId}/government_licenses/${departmentId}/${folderId}/${docSlug}_${Date.now()}_${cleanName}`;
  const fileRef = storageRef(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      companyId,
      departmentId,
      folderId,
      documentNumber: String(documentNumber || ''),
    },
  });

  const downloadUrl = await getDownloadURL(fileRef);
  return { downloadUrl, storagePath };
}
