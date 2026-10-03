import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import type { CompanyGovComplianceTreeDoc, ComplianceTreeGovernmentDepartment } from '../types/companyComplianceTree';
import {
  GOV_COMPLIANCE_TREE_DOC_ID,
  resolveGovTreeSeedForCompany,
} from '../config/defaultGovComplianceTree';

export async function saveGovComplianceTree(
  companyId: string,
  departments: ComplianceTreeGovernmentDepartment[]
): Promise<void> {
  const payload: CompanyGovComplianceTreeDoc = {
    id: GOV_COMPLIANCE_TREE_DOC_ID,
    companyId,
    departments,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  await setDoc(
    doc(db, 'companies', companyId, 'compliance', GOV_COMPLIANCE_TREE_DOC_ID),
    cleanFirestoreData(payload),
    { merge: true }
  );
}

export function subscribeGovComplianceTree(
  companyId: string,
  onData: (departments: ComplianceTreeGovernmentDepartment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const ref = doc(db, 'companies', companyId, 'compliance', GOV_COMPLIANCE_TREE_DOC_ID);
  return onSnapshot(
    ref,
    snap => {
      if (!snap.exists()) {
        onData(resolveGovTreeSeedForCompany(companyId));
        return;
      }
      const data = snap.data() as CompanyGovComplianceTreeDoc;
      const departments = Array.isArray(data.departments) ? data.departments : [];
      onData(departments.length ? departments : resolveGovTreeSeedForCompany(companyId));
    },
    err => {
      console.error('[GovComplianceTree] subscribe failed:', err);
      onError?.(err as Error);
      onData(resolveGovTreeSeedForCompany(companyId));
    }
  );
}
