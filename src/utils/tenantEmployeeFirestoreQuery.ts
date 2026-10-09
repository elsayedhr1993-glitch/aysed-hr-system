import { collection, query, where, type Query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { contractQueryCompanyIds } from './contractTenantRules';

/** Firestore `employees` query scoped to all legacy/canonical company ids for the tenant session. */
export function buildTenantEmployeesQuery(activeCompanyId: string): Query | null {
  const id = String(activeCompanyId || '').trim();
  if (!id) return null;

  const companyIds = contractQueryCompanyIds(id);
  if (companyIds.length === 0) return null;

  if (companyIds.length === 1) {
    return query(collection(db, 'employees'), where('companyId', '==', companyIds[0]));
  }

  return query(collection(db, 'employees'), where('companyId', 'in', companyIds));
}

export function tenantEmployeeQueryCompanyIds(activeCompanyId: string): string[] {
  return contractQueryCompanyIds(activeCompanyId);
}
