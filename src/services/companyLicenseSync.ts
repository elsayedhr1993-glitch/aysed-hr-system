import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import type { Company } from '../types';
import type { CompanyDocument } from '../types/companyDocuments';
import { formatCompanyDocumentType } from '../types/companyDocuments';
import type { FacilityLicenseData } from '../types/facilityLicense';
import { createEmptyFacilityData } from '../types/facilityLicense';
import { cleanFirestoreData, db, getCompaniesCollectionName } from '../lib/firebase';
import { contractQueryCompanyIds, normalizeTenantCompanyId } from '../utils/contractTenantRules';

const FAR_FUTURE_EXPIRY = '2099-12-31';
const FACILITY_CONFIG_COLLECTION = 'system_config';
const FACILITY_DOC_PREFIX = 'facility_licensing_';

export function getFacilityLicensingDocId(companyId: string): string {
  return `${FACILITY_DOC_PREFIX}${normalizeTenantCompanyId(companyId)}`;
}

function stableLicenseDocId(companyId: string, slug: string): string {
  return `lic-${normalizeTenantCompanyId(companyId)}-${slug}`;
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

function docBelongsToTenant(doc: CompanyDocument, tenantId: string): boolean {
  const docCo = normalizeTenantCompanyId(doc.companyId || tenantId);
  return docCo === tenantId || !doc.companyId;
}

/** Map wizard master data → tracked rows in `company_documents`. */
export function buildCompanyDocumentsFromFacility(
  companyId: string,
  data: FacilityLicenseData
): CompanyDocument[] {
  const tenantId = normalizeTenantCompanyId(companyId);
  const issueFallback = data.mohStartDate || new Date().toISOString().split('T')[0];
  const docs: CompanyDocument[] = [];

  if (data.commercialRegNo?.trim()) {
    docs.push({
      id: stableLicenseDocId(tenantId, 'commercial'),
      companyId: tenantId,
      name: data.nameAr?.trim() ? `السجل التجاري — ${data.nameAr.trim()}` : 'السجل التجاري / الرخصة التجارية',
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
      id: stableLicenseDocId(tenantId, 'moh'),
      companyId: tenantId,
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
      id: stableLicenseDocId(tenantId, 'pam'),
      companyId: tenantId,
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
      id: stableLicenseDocId(tenantId, 'kff'),
      companyId: tenantId,
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
      id: stableLicenseDocId(tenantId, 'baladiya'),
      companyId: tenantId,
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

function parseMohDeptsFromNotes(notes?: string): string[] | undefined {
  if (!notes) return undefined;
  const match = notes.match(/أقسام:\s*(.+)/);
  if (!match) return undefined;
  return match[1]
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSignatoryFromNotes(notes?: string): string | undefined {
  if (!notes) return undefined;
  const match = notes.match(/المفوض بالتوقيع:\s*(.+)/);
  return match?.[1]?.trim();
}

function parseBranchFromNotes(notes?: string): string | undefined {
  if (!notes) return undefined;
  const match = notes.match(/الفرع:\s*(.+)/);
  return match?.[1]?.trim();
}

/** Archive rows → wizard master fields (bidirectional sync). */
export function deriveFacilityPatchFromLicenses(
  companyId: string,
  documents: CompanyDocument[]
): Partial<FacilityLicenseData> {
  const tenantId = normalizeTenantCompanyId(companyId);
  const patch: Partial<FacilityLicenseData> = {};

  for (const d of documents) {
    if (!docBelongsToTenant(d, tenantId)) continue;
    const num = String(d.documentNumber || '').trim();
    if (!num) continue;
    const type = String(d.documentType || '');
    const id = d.id;

    if (isCommercialType(type) || id === stableLicenseDocId(tenantId, 'commercial')) {
      patch.commercialRegNo = num;
      const branch = parseBranchFromNotes(d.notes);
      if (branch) patch.mainBranchName = branch;
    } else if (isMohType(type) || id === stableLicenseDocId(tenantId, 'moh')) {
      patch.mohLicenseNo = num;
      if (d.issueDate) patch.mohStartDate = d.issueDate;
      if (d.expiryDate) patch.mohExpiryDate = d.expiryDate;
      const depts = parseMohDeptsFromNotes(d.notes);
      if (depts?.length) patch.mohApprovedDepts = depts;
    } else if (isPamType(type) || id === stableLicenseDocId(tenantId, 'pam')) {
      patch.pamFileCode = num;
      const signatory = parseSignatoryFromNotes(d.notes);
      if (signatory) patch.authorizedSignatoryName = signatory;
    } else if (isFireType(type) || id === stableLicenseDocId(tenantId, 'kff')) {
      patch.kffLicenseNo = num;
      if (d.expiryDate) patch.kffExpiryDate = d.expiryDate;
    } else if (isMunicipalityType(type) || id === stableLicenseDocId(tenantId, 'baladiya')) {
      patch.baladiyaLicenseNo = num;
      if (d.expiryDate) patch.baladiyaExpiryDate = d.expiryDate;
    }
  }

  return patch;
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

export async function loadFacilityMasterData(
  companyId: string
): Promise<FacilityLicenseData | null> {
  if (!isSyncableTenantCompanyId(companyId)) return null;
  const snap = await getDoc(
    doc(db, FACILITY_CONFIG_COLLECTION, getFacilityLicensingDocId(companyId))
  );
  if (!snap.exists()) return null;
  return { ...createEmptyFacilityData(), ...(snap.data() as FacilityLicenseData) };
}

export async function fetchCompanyDocumentsForTenant(
  companyId: string
): Promise<CompanyDocument[]> {
  const tenantId = normalizeTenantCompanyId(companyId);
  const companyIds = contractQueryCompanyIds(tenantId);
  const q =
    companyIds.length === 1
      ? query(collection(db, 'company_documents'), where('companyId', '==', companyIds[0]))
      : query(collection(db, 'company_documents'), where('companyId', 'in', companyIds));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as CompanyDocument),
    id: d.id,
    companyId: tenantId,
  }));
}

export type LicenseSyncOptions = {
  persistFacilityMaster?: boolean;
  markFacilityCompleted?: boolean;
};

function mergeLicenseDocuments(
  tenantId: string,
  archiveDocs: CompanyDocument[],
  facility: FacilityLicenseData
): CompanyDocument[] {
  const facilityDocs = buildCompanyDocumentsFromFacility(tenantId, facility);
  const byId = new Map<string, CompanyDocument>();
  for (const d of archiveDocs) {
    if (docBelongsToTenant(d, tenantId)) {
      byId.set(d.id, { ...d, companyId: tenantId });
    }
  }
  for (const d of facilityDocs) {
    byId.set(d.id, d);
  }
  return [...byId.values()];
}

function mergeFacilityMaster(
  existing: FacilityLicenseData,
  archiveDocs: CompanyDocument[],
  tenantId: string,
  wizardPatch?: FacilityLicenseData | null
): FacilityLicenseData {
  const fromArchive = deriveFacilityPatchFromLicenses(tenantId, archiveDocs);

  if (wizardPatch) {
    return {
      ...existing,
      ...fromArchive,
      ...wizardPatch,
      mohApprovedDepts:
        wizardPatch.mohApprovedDepts?.length
          ? wizardPatch.mohApprovedDepts
          : fromArchive.mohApprovedDepts?.length
            ? fromArchive.mohApprovedDepts
            : existing.mohApprovedDepts,
      branchesList: wizardPatch.branchesList ?? existing.branchesList,
      mohSpecialDevices: wizardPatch.mohSpecialDevices ?? existing.mohSpecialDevices,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    ...existing,
    ...fromArchive,
    mohApprovedDepts:
      fromArchive.mohApprovedDepts?.length ? fromArchive.mohApprovedDepts : existing.mohApprovedDepts,
    branchesList: existing.branchesList,
    mohSpecialDevices: existing.mohSpecialDevices,
    lastUpdated: new Date().toISOString(),
  };
}

/** Single hub: wizard ↔ archive ↔ company print profile. */
export async function syncTenantLicensesAndCompanyProfile(
  companyId: string,
  documents: CompanyDocument[],
  facilityInput?: FacilityLicenseData | null,
  options: LicenseSyncOptions = {}
): Promise<void> {
  if (!isSyncableTenantCompanyId(companyId)) return;

  const tenantId = normalizeTenantCompanyId(companyId);
  const persistFacility = options.persistFacilityMaster !== false;

  const existingFacility =
    (await loadFacilityMasterData(tenantId)) || createEmptyFacilityData();
  const archiveDocs =
    documents.length > 0 ? documents : await fetchCompanyDocumentsForTenant(tenantId);

  const mergedFacility = mergeFacilityMaster(
    existingFacility,
    archiveDocs,
    tenantId,
    facilityInput || null
  );

  if (options.markFacilityCompleted) {
    mergedFacility.isCompleted = true;
  }

  const mergedDocs = mergeLicenseDocuments(tenantId, archiveDocs, mergedFacility);

  for (const row of mergedDocs) {
    await setDoc(doc(db, 'company_documents', row.id), cleanFirestoreData(row), { merge: true });
  }

  if (persistFacility) {
    await setDoc(
      doc(db, FACILITY_CONFIG_COLLECTION, getFacilityLicensingDocId(tenantId)),
      cleanFirestoreData(mergedFacility),
      { merge: true }
    );
  }

  const profilePatch = deriveCompanyProfilePatchFromLicenses(mergedDocs, mergedFacility);
  if (Object.keys(profilePatch).length > 0) {
    await setDoc(
      doc(db, getCompaniesCollectionName(), tenantId),
      cleanFirestoreData({
        ...profilePatch,
        id: tenantId,
        licensesSyncedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  }

  window.dispatchEvent(
    new CustomEvent('facility_data_updated', { detail: { companyId: tenantId } })
  );
}

/** Wizard step edits → archive + facility master (live sync). */
export async function syncFacilityWizardDraft(
  companyId: string,
  facilityDraft: FacilityLicenseData
): Promise<void> {
  await syncTenantLicensesAndCompanyProfile(companyId, [], facilityDraft, {
    persistFacilityMaster: true,
    markFacilityCompleted: Boolean(facilityDraft.isCompleted),
  });
}
