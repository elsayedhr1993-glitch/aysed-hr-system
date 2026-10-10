import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { cleanFirestoreData, db, getCompaniesCollectionName } from '../lib/firebase';
import type { DepartmentId, LicenseDocument } from '../types/governmentLicense';
import {
  governmentLicenseCompanyDocumentId,
  removeGovernmentLicenseFromEnterprise,
  syncGovernmentLicenseAcrossSystem,
} from './governmentLicenseComplianceSync';

const LICENSES_SUBCOLLECTION = 'licenses';

function licensesCollection(companyId: string) {
  return collection(db, getCompaniesCollectionName(), companyId, LICENSES_SUBCOLLECTION);
}

function licenseDocRef(companyId: string, licenseId: string) {
  return doc(db, getCompaniesCollectionName(), companyId, LICENSES_SUBCOLLECTION, licenseId);
}

function mapLicenseDoc(companyId: string, id: string, raw: Record<string, unknown>): LicenseDocument {
  return {
    id,
    companyId,
    departmentId: String(raw.departmentId || 'MOH') as DepartmentId,
    folderId: String(raw.folderId || ''),
    title: String(raw.title || ''),
    documentNumber: String(raw.documentNumber || ''),
    expiryDate: String(raw.expiryDate || ''),
    fileUrl: raw.fileUrl ? String(raw.fileUrl) : undefined,
    employeeId: raw.employeeId ? String(raw.employeeId) : undefined,
    employeeName: raw.employeeName ? String(raw.employeeName) : undefined,
    vehiclePlate: raw.vehiclePlate ? String(raw.vehiclePlate) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    companyDocumentId: raw.companyDocumentId ? String(raw.companyDocumentId) : undefined,
    archived: raw.archived === true,
    archivedAt: raw.archivedAt ? String(raw.archivedAt) : undefined,
  };
}

export async function getGovernmentLicense(
  companyId: string,
  licenseId: string
): Promise<LicenseDocument | null> {
  const snap = await getDoc(licenseDocRef(companyId, licenseId));
  if (!snap.exists()) return null;
  return mapLicenseDoc(companyId, snap.id, snap.data() as Record<string, unknown>);
}

export function subscribeGovernmentLicenses(
  companyId: string,
  onData: (licenses: LicenseDocument[]) => void,
  filters?: { departmentId?: DepartmentId; folderId?: string; employeeId?: string }
): () => void {
  const constraints: QueryConstraint[] = [];
  if (filters?.departmentId) {
    constraints.push(where('departmentId', '==', filters.departmentId));
  }
  if (filters?.folderId) {
    constraints.push(where('folderId', '==', filters.folderId));
  }
  if (filters?.employeeId) {
    constraints.push(where('employeeId', '==', filters.employeeId));
  }

  const q =
    constraints.length > 0
      ? query(licensesCollection(companyId), ...constraints)
      : licensesCollection(companyId);

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => mapLicenseDoc(companyId, d.id, d.data() as Record<string, unknown>));
      onData(list);
    },
    (err) => {
      console.error('[governmentLicenseService] subscribe failed:', err);
      onData([]);
    }
  );
}

export async function upsertGovernmentLicense(
  companyId: string,
  license: Omit<LicenseDocument, 'companyId' | 'updatedAt'> & { id?: string }
): Promise<string> {
  const id = license.id || doc(licensesCollection(companyId)).id;
  const companyDocumentId = governmentLicenseCompanyDocumentId(companyId, id);
  const payload: LicenseDocument = {
    ...license,
    id,
    companyId,
    companyDocumentId,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(licenseDocRef(companyId, id), cleanFirestoreData(payload), { merge: true });
  try {
    await syncGovernmentLicenseAcrossSystem(payload);
  } catch (err) {
    console.error('[governmentLicenseService] cross-system sync failed:', err);
  }
  return id;
}

export async function deleteGovernmentLicense(companyId: string, licenseId: string): Promise<void> {
  try {
    await removeGovernmentLicenseFromEnterprise(companyId, licenseId);
  } catch (err) {
    console.error('[governmentLicenseService] enterprise cleanup failed:', err);
  }
  await deleteDoc(licenseDocRef(companyId, licenseId));
}

export async function archiveGovernmentLicense(
  companyId: string,
  licenseId: string,
  archived: boolean
): Promise<void> {
  const archivedAt = archived ? new Date().toISOString() : undefined;
  await setDoc(
    licenseDocRef(companyId, licenseId),
    cleanFirestoreData({
      archived,
      archivedAt: archived ? archivedAt : null,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
  const license = await getGovernmentLicense(companyId, licenseId);
  if (!license) return;
  try {
    await syncGovernmentLicenseAcrossSystem({ ...license, archived, archivedAt });
  } catch (err) {
    console.error('[governmentLicenseService] archive sync failed:', err);
  }
}
