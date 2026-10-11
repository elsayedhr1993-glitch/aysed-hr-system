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

  const merged = new Map<string, Record<string, unknown>>();

  const runQuery = async (field: 'companyId' | 'company_id', chunk: string[]) => {
    const snap =
      chunk.length === 1
        ? await db.collection('employees').where(field, '==', chunk[0]).get()
        : await db.collection('employees').where(field, 'in', chunk).get();
    snap.docs.forEach((d) => {
      merged.set(d.id, { id: d.id, ...(d.data() as Record<string, unknown>), _tenantFirestoreMatch: true });
    });
  };

  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    await runQuery('companyId', chunk);
    await runQuery('company_id', chunk);
  }

  return [...merged.values()].filter((row) => employeeBelongsToTenant(row, companyId));
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
