import { saveEmployeeDocument } from '../services/documentService';
import { syncEmployeeDocumentsToArchive } from '../services/employeeDocumentArchiveSync';
import { TenantDatabaseService } from '../services/tenantDataService';
import type { Employee } from '../types';

export async function attachSignedContractFileToEmployee(
  employee: Record<string, unknown>,
  file: File,
  companyId: string
): Promise<Record<string, unknown>> {
  const employeeId = String(employee.id || '');
  if (!employeeId) throw new Error('معرّف الموظف غير متوفر');

  const base64Url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
    reader.readAsDataURL(file);
  });

  const fileInfo = {
    id: `${employeeId}-signedContract`,
    employeeId,
    companyId,
    docKey: 'signedContract',
    employeeNameAr: String(employee.fullNameAr || employee.nameAr || employee.name || 'موظف'),
    civilId: String(employee.civilId || ''),
    category: 'عقود وإقرارات قانونية (Contracts & Declarations)' as const,
    docTitleAr: 'عقد العمل الموقع',
    docTitleEn: 'Signed Employment Contract',
    fileType: file.type.includes('pdf') ? 'PDF' as const : 'JPG' as const,
    fileName: file.name,
    name: file.name,
    url: base64Url,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    uploadDate: new Date().toISOString().slice(0, 10),
    title: 'عقد العمل',
    type: file.type.includes('pdf') ? 'pdf' : 'image',
    status: 'verified',
  };

  await saveEmployeeDocument(fileInfo as any);

  const nextEmployee = {
    ...employee,
    companyId: companyId || employee.companyId,
    documentFiles: {
      ...((employee.documentFiles as Record<string, unknown>) || {}),
      signedContract: fileInfo,
    },
  };

  await TenantDatabaseService.saveEmployee(nextEmployee as Employee, companyId);
  await syncEmployeeDocumentsToArchive(nextEmployee as Record<string, unknown>).catch(() => undefined);

  return nextEmployee;
}
