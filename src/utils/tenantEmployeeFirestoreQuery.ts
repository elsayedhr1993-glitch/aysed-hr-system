import type { Query } from 'firebase/firestore';
import { contractQueryCompanyIds } from './contractTenantRules';
import { buildTenantEmployeeFirestoreQueries } from './subscribeTenantEmployees';

/** Primary Firestore query (first of merged tenant queries). Prefer subscribeMergedTenantEmployees. */
export function buildTenantEmployeesQuery(activeCompanyId: string): Query | null {
  const queries = buildTenantEmployeeFirestoreQueries(activeCompanyId, {
    includeLegacyCompanyIdField: true,
  });
  return queries[0] ?? null;
}

export function tenantEmployeeQueryCompanyIds(activeCompanyId: string): string[] {
  return contractQueryCompanyIds(activeCompanyId);
}
