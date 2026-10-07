import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { cleanFirestoreData, db, getCompaniesCollectionName } from '../lib/firebase';
import type { DepartmentId, LicenseDocument } from '../types/governmentLicense';

const LICENSES_SUBCOLLECTION = 'licenses';

function licensesCollection(companyId: string) {
  return collection(db, getCompaniesCollectionName(), companyId, LICENSES_SUBCOLLECTION);
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
  };
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
  const payload: LicenseDocument = {
    ...license,
    id,
    companyId,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(
    doc(db, getCompaniesCollectionName(), companyId, LICENSES_SUBCOLLECTION, id),
    cleanFirestoreData(payload),
    { merge: true }
  );
  return id;
}

export async function deleteGovernmentLicense(companyId: string, licenseId: string): Promise<void> {
  await deleteDoc(doc(db, getCompaniesCollectionName(), companyId, LICENSES_SUBCOLLECTION, licenseId));
}
