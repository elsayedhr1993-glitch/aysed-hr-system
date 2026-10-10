import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { cleanFirestoreData, db, getCompaniesCollectionName } from '../lib/firebase';
import type { LicenseDocument, DepartmentId } from '../types/governmentLicense';
import type { CompanyDocument } from '../types/companyDocuments';
import { findDepartmentFolder } from '../config/governmentComplianceDepartments';
import { normalizeTenantCompanyId } from '../utils/contractTenantRules';
import {
  fetchCompanyDocumentsForTenant,
  syncTenantLicensesAndCompanyProfile,
} from './companyLicenseSync';

export function governmentLicenseCompanyDocumentId(companyId: string, licenseId: string): string {
  const tenantId = normalizeTenantCompanyId(companyId);
  return `gov-lic-${tenantId}-${licenseId}`;
}

function departmentDocumentMeta(departmentId: DepartmentId, folderId: string) {
  const { department, folder } = findDepartmentFolder(departmentId, folderId);
  const deptName = department?.name || departmentId;
  const folderName = folder?.name || folderId;

  let documentType = 'وثيقة امتثال حكومي';
  let issuingAuthority = deptName;

  switch (departmentId) {
    case 'MOH':
      documentType = 'ترخيص صحي/طبي';
      issuingAuthority = 'وزارة الصحة — دولة الكويت';
      break;
    case 'PAM':
      documentType = folderId === 'pam_permits' ? 'إذن عمل / PAM' : 'وثيقة الهيئة العامة للقوى العاملة';
      issuingAuthority = 'الهيئة العامة للقوى العاملة';
      break;
    case 'KFF':
      documentType = 'رخصة إطفاء وسلامة';
      issuingAuthority = 'قوة الإطفاء العام';
      break;
    case 'BALADIYA':
      documentType = 'رخصة بلدية';
      issuingAuthority = 'بلدية الكويت';
      break;
    case 'MOI_TRAFFIC':
      documentType = 'وثيقة مرور';
      issuingAuthority = 'الإدارة العامة للمرور';
      break;
    default:
      break;
  }

  return { documentType, issuingAuthority, deptName, folderName };
}

export function licenseToCompanyDocument(license: LicenseDocument): CompanyDocument {
  const tenantId = normalizeTenantCompanyId(license.companyId);
  const meta = departmentDocumentMeta(license.departmentId, license.folderId);
  const notes = [
    `مصدر: شجرة الامتثال الحكومي`,
    `${meta.deptName} / ${meta.folderName}`,
    license.employeeName ? `موظف: ${license.employeeName}` : '',
    license.vehiclePlate ? `مركبة: ${license.vehiclePlate}` : '',
    license.archived ? 'حالة: مؤرشف' : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    id: governmentLicenseCompanyDocumentId(tenantId, license.id),
    companyId: tenantId,
    name: license.title,
    documentType: meta.documentType,
    documentNumber: license.documentNumber,
    issuingAuthority: meta.issuingAuthority,
    issueDate: license.updatedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    expiryDate: license.expiryDate,
    fileUrl: license.fileUrl,
    notes,
  };
}

async function patchEmployeeFromGovernmentLicense(license: LicenseDocument): Promise<void> {
  const employeeId = String(license.employeeId || '').trim();
  if (!employeeId) return;

  const empRef = doc(db, 'employees', employeeId);
  const snap = await getDoc(empRef);
  if (!snap.exists()) return;

  const patch: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (license.departmentId === 'MOH') {
    patch.mohLicenseNo = license.documentNumber;
    patch.mohLicense = license.documentNumber;
    patch.mohLicenseExpiry = license.expiryDate;
  }

  if (license.departmentId === 'PAM' && license.folderId === 'pam_permits') {
    patch.residencyExpiry = license.expiryDate;
    patch.workPermitNo = license.documentNumber;
    patch.contractEndDate = license.expiryDate;
  }

  if (license.departmentId === 'PAM' && license.folderId === 'pam_mandate') {
    const civilDigits = license.documentNumber.replace(/\D/g, '');
    if (civilDigits.length >= 10) {
      patch.civilId = civilDigits;
      patch.civil_id = civilDigits;
      patch.civil_id_number = civilDigits;
    }
    patch.civilIdExpiry = license.expiryDate;
  }

  if (license.fileUrl) {
    const existingFiles = (snap.data() as { documentFiles?: Record<string, unknown> }).documentFiles || {};
    const slot =
      license.departmentId === 'MOH'
        ? 'mohLicense'
        : license.folderId === 'pam_permits'
          ? 'pamWorkPermit'
          : license.departmentId === 'PAM'
            ? 'pamWorkPermit'
            : 'civilIdScan';
    patch.documentFiles = {
      ...existingFiles,
      [slot]: {
        fileUrl: license.fileUrl,
        fileName: `${license.title}.pdf`,
        uploadDate: new Date().toISOString(),
        expiryDate: license.expiryDate,
      },
    };
  }

  await setDoc(empRef, cleanFirestoreData(patch), { merge: true });
}

/** Mirror gov license → company archive + company profile + employee (when linked). */
export async function syncGovernmentLicenseAcrossSystem(license: LicenseDocument): Promise<void> {
  if (!license.companyId) return;
  const tenantId = normalizeTenantCompanyId(license.companyId);
  const archiveId = governmentLicenseCompanyDocumentId(tenantId, license.id);

  const archiveDoc = licenseToCompanyDocument(license);
  await setDoc(doc(db, 'company_documents', archiveId), cleanFirestoreData(archiveDoc), {
    merge: true,
  });
  if (!license.archived) {
    await patchEmployeeFromGovernmentLicense(license);
  }

  const allDocs = await fetchCompanyDocumentsForTenant(tenantId);
  await syncTenantLicensesAndCompanyProfile(tenantId, allDocs, null, {
    persistFacilityMaster: false,
  });
}

export async function removeGovernmentLicenseFromEnterprise(
  companyId: string,
  licenseId: string
): Promise<void> {
  const tenantId = normalizeTenantCompanyId(companyId);
  const archiveId = governmentLicenseCompanyDocumentId(tenantId, licenseId);
  try {
    await deleteDoc(doc(db, 'company_documents', archiveId));
  } catch {
    /* optional */
  }
  const allDocs = await fetchCompanyDocumentsForTenant(tenantId);
  await syncTenantLicensesAndCompanyProfile(tenantId, allDocs, null, {
    persistFacilityMaster: false,
  });
}
