import type { Firestore } from 'firebase-admin/firestore';
import {
  contractQueryCompanyIds,
  employeeBelongsToTenant,
} from '../../src/utils/contractTenantRules';

export async function fetchTenantEmployeeDocs(
  db: Firestore,
  companyId: string
): Promise<Record<string, unknown>[]> {
  const ids = contractQueryCompanyIds(companyId);
  if (!ids.length) return [];

  const snap =
    ids.length === 1
      ? await db.collection('employees').where('companyId', '==', ids[0]).get()
      : await db.collection('employees').where('companyId', 'in', ids).get();

  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    .filter((row) => employeeBelongsToTenant(row, companyId));
}

export async function fetchTenantContractDocs(
  db: Firestore,
  companyId: string
): Promise<Record<string, unknown>[]> {
  const ids = contractQueryCompanyIds(companyId);
  if (!ids.length) return [];

  const snap =
    ids.length === 1
      ? await db.collection('contracts').where('companyId', '==', ids[0]).get()
      : await db.collection('contracts').where('companyId', 'in', ids).get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
}
