import { doc, setDoc } from 'firebase/firestore';
import type { Company } from '../types';
import type { CompanyDocument } from '../types/companyDocuments';
import { formatCompanyDocumentType } from '../types/companyDocuments';
import type { FacilityLicenseData } from '../components/facility/FacilityLicensingWizardModal';
import { cleanFirestoreData, db, getCompaniesCollectionName } from '../lib/firebase';

const FAR_FUTURE_EXPIRY = '2099-12-31';

function stableLicenseDocId(companyId: string, slug: string): string {
  return `lic-${companyId}-${slug}`;
}

function isCommercialType(documentType: string): boolean {
  const t = `${documentType} ${formatCompanyDocumentType(documentType)}`.toLowerCase();
  return (
    documentType === 'commercial_license' ||
    t.includes('تجاري') ||
    t.includes('commercial') ||
    t.includes('سجل')
  );
}

function isMohType(documentType: string): boolean {
  const t = `${documentType} ${formatCompanyDocumentType(documentType)}`.toLowerCase();
  return (
    documentType === 'medical_license' ||
    t.includes('moh') ||
    t.includes('صح') ||
    t.includes('طبي')
  );
}

function isPamType(documentType: string): boolean {
  const t = `${documentType} ${formatCompanyDocumentType(documentType)}`.toLowerCase();
  return t.includes('pam') || t.includes('قوى') || t.includes('شؤون') || t.includes('wps');
}

function isMunicipalityType(documentType: string): boolean {
  const t = `${documentType} ${formatCompanyDocumentType(documentType)}`.toLowerCase();
  return documentType === 'municipality' || t.includes('بلد') || t.includes('municip');
}

function isFireType(documentType: string): boolean {
  const t = `${documentType} ${formatCompanyDocumentType(documentType)}`.toLowerCase();
  return documentType === 'civil_defense' || t.includes('إطفاء') || t.includes('دفاع') || t.includes('fire');
}

/** Map wizard master data → tracked rows in `company_documents`. */
export function buildCompanyDocumentsFromFacility(
  companyId: string,
  data: FacilityLicenseData
): CompanyDocument[] {
  const issueFallback = data.mohStartDate || new Date().toISOString().split('T')[0];
  const docs: CompanyDocument[] = [];

  if (data.commercialRegNo?.trim()) {
    docs.push({
      id: stableLicenseDocId(companyId, 'commercial'),
      companyId,
      name: 'السجل التجاري / الرخصة التجارية',
      documentType: 'رخصة تجارية',
      documentNumber: data.commercialRegNo.trim(),
      issuingAuthority: 'وزارة التجارة والصناعة',
      issueDate: issueFallback,
      expiryDate: FAR_FUTURE_EXPIRY,
      notes: data.mainBranchName ? `الفرع: ${data.mainBranchName}` : '',
    });
  }

  if (data.mohLicenseNo?.trim()) {
    docs.push({
      id: stableLicenseDocId(companyId, 'moh'),
      companyId,
      name: 'ترخيص وزارة الصحة',
      documentType: 'ترخيص صحي/طبي',
      documentNumber: data.mohLicenseNo.trim(),
      issuingAuthority: 'وزارة الصحة — دولة الكويت',
      issueDate: data.mohStartDate || issueFallback,
      expiryDate: data.mohExpiryDate || FAR_FUTURE_EXPIRY,
      notes: data.mohApprovedDepts?.length ? `أقسام: ${data.mohApprovedDepts.join('، ')}` : '',
    });
  }

  if (data.pamFileCode?.trim()) {
    docs.push({
      id: stableLicenseDocId(companyId, 'pam'),
      companyId,
      name: 'ملف الشؤون — القوى العاملة (PAM/WPS)',
      documentType: 'ملف الشؤون PAM/WPS',
      documentNumber: data.pamFileCode.trim(),
      issuingAuthority: 'الهيئة العامة للقوى العاملة',
      issueDate: issueFallback,
      expiryDate: FAR_FUTURE_EXPIRY,
      notes: data.authorizedSignatoryName
        ? `المفوض بالتوقيع: ${data.authorizedSignatoryName}`
        : '',
    });
  }

  if (data.kffLicenseNo?.trim()) {
    docs.push({
      id: stableLicenseDocId(companyId, 'kff'),
      companyId,
      name: 'ترخيص الإطفاء / الدفاع المدني',
      documentType: 'دفاع مدني',
      documentNumber: data.kffLicenseNo.trim(),
      issuingAuthority: 'إدارة الإطفاء العام — دولة الكويت',
      issueDate: issueFallback,
      expiryDate: data.kffExpiryDate || FAR_FUTURE_EXPIRY,
    });
  }

  if (data.baladiyaLicenseNo?.trim()) {
    docs.push({
      id: stableLicenseDocId(companyId, 'baladiya'),
      companyId,
      name: 'رخصة البلدية',
      documentType: 'رخصة بلدية',
      documentNumber: data.baladiyaLicenseNo.trim(),
      issuingAuthority: 'بلدية الكويت',
      issueDate: issueFallback,
      expiryDate: data.baladiyaExpiryDate || FAR_FUTURE_EXPIRY,
    });
  }

  return docs;
}

/** Derive `companies/{id}` fields for print headers from licenses + optional wizard data. */
export function deriveCompanyProfilePatchFromLicenses(
  documents: CompanyDocument[],
  facility?: FacilityLicenseData | null
): Partial<Company> {
  const patch: Partial<Company> = {};

  if (facility) {
    if (facility.nameAr?.trim()) {
      patch.nameAr = facility.nameAr.trim();
      patch.name = facility.nameAr.trim();
    }
    if (facility.nameEn?.trim()) patch.nameEn = facility.nameEn.trim();
    if (facility.commercialRegNo?.trim()) {
      patch.commercialRegNo = facility.commercialRegNo.trim();
      patch.crNumber = facility.commercialRegNo.trim();
    }
    if (facility.paciCivilId?.trim()) {
      patch.civilIdCompany = facility.paciCivilId.trim();
      (patch as { paciNumber?: string }).paciNumber = facility.paciCivilId.trim();
    }
    if (facility.logoUrl?.trim()) {
      patch.logoUrl = facility.logoUrl.trim();
      patch.logo = facility.logoUrl.trim();
    }
    if (facility.mohLicenseNo?.trim()) patch.mohLicense = facility.mohLicenseNo.trim();
    if (facility.pamFileCode?.trim()) patch.wsiCode = facility.pamFileCode.trim();
    if (facility.authorizedSignatoryName?.trim()) {
      patch.authorizedSignatory = facility.authorizedSignatoryName.trim();
    }
  }

  for (const d of documents) {
    const num = String(d.documentNumber || '').trim();
    if (!num) continue;
    const type = String(d.documentType || '');
    if (isCommercialType(type)) {
      patch.commercialRegNo = num;
      patch.crNumber = num;
    } else if (isMohType(type)) {
      patch.mohLicense = num;
    } else if (isPamType(type)) {
      patch.wsiCode = num;
    }
  }

  return patch;
}

export function isSyncableTenantCompanyId(companyId?: string | null): boolean {
  const id = String(companyId || '').trim();
  if (!id) return false;
  if (id === 'SAAS_PLATFORM' || id === 'comp-super-admin') return false;
  return true;
}

/** Upsert license rows and mirror identity into `companies/{id}` for print profile. */
export async function syncTenantLicensesAndCompanyProfile(
  companyId: string,
  documents: CompanyDocument[],
  facility?: FacilityLicenseData | null
): Promise<void> {
  if (!isSyncableTenantCompanyId(companyId)) return;

  const facilityDocs = facility ? buildCompanyDocumentsFromFacility(companyId, facility) : [];
  const byId = new Map<string, CompanyDocument>();
  for (const d of documents) {
    if (d.companyId === companyId || !d.companyId) {
      byId.set(d.id, { ...d, companyId });
    }
  }
  for (const d of facilityDocs) {
    byId.set(d.id, d);
  }
  const mergedDocs = [...byId.values()];

  for (const row of facilityDocs) {
    await setDoc(doc(db, 'company_documents', row.id), cleanFirestoreData(row), { merge: true });
  }

  const profilePatch = deriveCompanyProfilePatchFromLicenses(mergedDocs, facility);
  if (Object.keys(profilePatch).length === 0) return;

  await setDoc(
    doc(db, getCompaniesCollectionName(), companyId),
    cleanFirestoreData({
      ...profilePatch,
      id: companyId,
      licensesSyncedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}
