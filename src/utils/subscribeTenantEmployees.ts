import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Query,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { contractQueryCompanyIds } from './contractTenantRules';
import { logEmployeeFetchPipeline, logFirestoreEmployeeFetchSummary } from './employeeFetchDebug';

export type TenantEmployeeSubscribeOptions = {
  /** Include docs with missing/empty companyId and comp-super-admin bucket */
  includeUnlinked?: boolean;
  /** Also query legacy `company_id` field (default: true — no row cap on queries) */
  includeLegacyCompanyIdField?: boolean;
};

function chunkCompanyIds(ids: string[]): string[][] {
  const unique = [...new Set(ids.filter(Boolean))];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) {
    chunks.push(unique.slice(i, i + 10));
  }
  return chunks;
}

export function buildTenantEmployeeFirestoreQueries(
  activeCompanyId: string,
  options: TenantEmployeeSubscribeOptions = {}
): Query[] {
  const id = String(activeCompanyId || '').trim();
  if (!id) return [];

  const includeLegacy = options.includeLegacyCompanyIdField !== false;

  const companyIds = new Set(contractQueryCompanyIds(id));
  if (options.includeUnlinked) {
    companyIds.add('comp-super-admin');
  }

  const idList = [...companyIds].filter((v) => v !== '');
  const coll = collection(db, 'employees');
  const queries: Query[] = [];

  for (const chunk of chunkCompanyIds(idList)) {
    if (chunk.length === 1) {
      queries.push(query(coll, where('companyId', '==', chunk[0])));
    } else if (chunk.length > 1) {
      queries.push(query(coll, where('companyId', 'in', chunk)));
    }
  }

  if (includeLegacy) {
    for (const chunk of chunkCompanyIds(idList)) {
      if (chunk.length === 1) {
        queries.push(query(coll, where('company_id', '==', chunk[0])));
      } else if (chunk.length > 1) {
        queries.push(query(coll, where('company_id', 'in', chunk)));
      }
    }
  }

  if (options.includeUnlinked) {
    queries.push(query(coll, where('companyId', '==', '')));
  }

  return queries;
}

export function subscribeMergedTenantEmployees(
  activeCompanyId: string,
  options: TenantEmployeeSubscribeOptions,
  onMergedSnapshot: (docs: Array<{ id: string; data: DocumentData }>) => void,
  onError?: (error: unknown) => void
): () => void {
  const queries = buildTenantEmployeeFirestoreQueries(activeCompanyId, options);
  const includeLegacyCompanyIdField = options.includeLegacyCompanyIdField !== false;
  if (!queries.length) {
    onMergedSnapshot([]);
    return () => undefined;
  }

  const perQueryMaps = new Map<number, Map<string, DocumentData>>();
  const unsubs: Array<() => void> = [];

  const emit = () => {
    const merged = new Map<string, DocumentData>();
    perQueryMaps.forEach((local) => {
      local.forEach((data, docId) => merged.set(docId, data));
    });
    const rows = [...merged.entries()].map(([docId, data]) => ({
      id: docId,
      data: { ...data, _tenantFirestoreMatch: true },
    }));
    logFirestoreEmployeeFetchSummary(activeCompanyId, rows, {
      queryCount: queries.length,
      includeUnlinked: options.includeUnlinked,
      includeLegacyCompanyIdField,
    });
    logEmployeeFetchPipeline('firestore-merged', {
      companyId: activeCompanyId,
      firestoreRawCount: rows.length,
      extra: {
        queryCount: queries.length,
        includeUnlinked: options.includeUnlinked,
      },
    });
    onMergedSnapshot(rows);
  };

  queries.forEach((q, index) => {
    const unsub = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const local = new Map<string, DocumentData>();
        snapshot.docs.forEach((docSnap) => {
          local.set(docSnap.id, { ...docSnap.data(), id: docSnap.id });
        });
        perQueryMaps.set(index, local);
        emit();
      },
      (error) => {
        const code = String((error as { code?: string })?.code || '');
        console.error(`[subscribeTenantEmployees] query #${index} failed:`, error);
        if (code === 'permission-denied') {
          perQueryMaps.set(index, new Map());
          emit();
          return;
        }
        onError?.(error);
      }
    );
    unsubs.push(unsub);
  });

  return () => {
    unsubs.forEach((u) => u());
  };
}
