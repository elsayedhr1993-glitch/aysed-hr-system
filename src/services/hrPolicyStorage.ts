import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';

export async function loadTenantPolicy<T extends Record<string, unknown>>(
  companyId: string,
  collectionKey: string,
  localFallback: () => T,
  localCacheKey?: string
): Promise<T> {
  if (!companyId) return localFallback();

  const docId = `${collectionKey}_${companyId}`;
  try {
    const snap = await getDoc(doc(db, 'system_config', docId));
    if (snap.exists()) {
      const merged = { ...localFallback(), ...snap.data() } as T;
      if (localCacheKey) {
        try {
          localStorage.setItem(localCacheKey, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      }
      return merged;
    }
  } catch (error) {
    console.error(`loadTenantPolicy(${collectionKey}) failed`, error);
  }

  if (localCacheKey) {
    try {
      const cached = localStorage.getItem(localCacheKey);
      if (cached) return { ...localFallback(), ...JSON.parse(cached) } as T;
    } catch {
      /* ignore */
    }
  }

  return localFallback();
}

export async function saveTenantPolicy<T extends Record<string, unknown>>(
  companyId: string,
  collectionKey: string,
  policy: T,
  localCacheKey?: string
): Promise<T> {
  const payload = {
    ...policy,
    companyId,
    lastUpdated: new Date().toISOString(),
    isActivated: true,
  } as T;

  if (companyId) {
    const docId = `${collectionKey}_${companyId}`;
    await setDoc(doc(db, 'system_config', docId), cleanFirestoreData(payload as Record<string, unknown>), {
      merge: true,
    });
  }

  if (localCacheKey) {
    try {
      localStorage.setItem(localCacheKey, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  return payload;
}
