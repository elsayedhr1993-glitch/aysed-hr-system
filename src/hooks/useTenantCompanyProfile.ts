import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Company } from '../types';
import { db, getCompaniesCollectionName } from '../lib/firebase';
import { mergeCompanyFromFirestore } from '../utils/companyPrintProfile';

/**
 * Merges activeCompany with Firestore `companies/{tenantId}` for print headers and compliance reports.
 */
export function useTenantCompanyProfile(
  tenantCompanyId: string | undefined,
  activeCompany: Company
): Company {
  const [merged, setMerged] = useState<Company>(() =>
    tenantCompanyId ? { ...activeCompany, id: tenantCompanyId } : activeCompany
  );

  useEffect(() => {
    if (!tenantCompanyId) {
      setMerged(activeCompany);
      return;
    }

    const ref = doc(db, getCompaniesCollectionName(), tenantCompanyId);
    return onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? (snap.data() as Record<string, unknown>) : undefined;
        setMerged(mergeCompanyFromFirestore(activeCompany, data, tenantCompanyId));
      },
      () => {
        setMerged({ ...activeCompany, id: tenantCompanyId });
      }
    );
  }, [tenantCompanyId, activeCompany.id, activeCompany.nameAr]);

  return merged;
}
