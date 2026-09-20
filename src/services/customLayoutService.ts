import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import { getDefaultScreenLayout } from '../config/defaultLayouts';
import type { ResolvedScreenLayout, ScreenCustomLayout, ScreenId } from '../types/customLayout';
import { layoutCacheKey, mergeScreenLayout } from '../utils/customLayoutUtils';

function layoutDocRef(companyId: string, screenId: ScreenId) {
  return doc(db, 'companies', companyId, 'custom_layouts', screenId);
}

function readCache(companyId: string, screenId: ScreenId): Partial<ScreenCustomLayout> | null {
  try {
    const raw = localStorage.getItem(layoutCacheKey(companyId, screenId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ScreenCustomLayout>;
  } catch {
    return null;
  }
}

function writeCache(companyId: string, screenId: ScreenId, layout: ScreenCustomLayout): void {
  try {
    localStorage.setItem(layoutCacheKey(companyId, screenId), JSON.stringify(layout));
  } catch {
    /* ignore */
  }
}

export function resolveLayoutFromParts(
  screenId: ScreenId,
  companyId: string,
  remote: Partial<ScreenCustomLayout> | null | undefined
): ResolvedScreenLayout {
  const defaults = getDefaultScreenLayout(screenId, companyId);
  return mergeScreenLayout(defaults, remote, companyId);
}

export async function loadScreenLayout(
  companyId: string,
  screenId: ScreenId
): Promise<ResolvedScreenLayout> {
  const defaults = getDefaultScreenLayout(screenId, companyId);
  if (!companyId || companyId === 'SAAS_PLATFORM') {
    return mergeScreenLayout(defaults, null, companyId || '');
  }

  try {
    const snap = await getDoc(layoutDocRef(companyId, screenId));
    if (snap.exists()) {
      const data = snap.data() as Partial<ScreenCustomLayout>;
      const merged = mergeScreenLayout(defaults, data, companyId);
      writeCache(companyId, screenId, {
        ...defaults,
        ...data,
        screenId,
        companyId,
      } as ScreenCustomLayout);
      return merged;
    }
  } catch (error) {
    console.error(`loadScreenLayout(${screenId}) failed`, error);
    const cached = readCache(companyId, screenId);
    if (cached) return mergeScreenLayout(defaults, cached, companyId);
  }

  return mergeScreenLayout(defaults, readCache(companyId, screenId), companyId);
}

export function subscribeScreenLayout(
  companyId: string,
  screenId: ScreenId,
  onLayout: (layout: ResolvedScreenLayout) => void,
  onError?: (error: Error) => void
): () => void {
  const defaults = getDefaultScreenLayout(screenId, companyId);
  if (!companyId || companyId === 'SAAS_PLATFORM') {
    onLayout(mergeScreenLayout(defaults, null, companyId || ''));
    return () => undefined;
  }

  return onSnapshot(
    layoutDocRef(companyId, screenId),
    snap => {
      const remote = snap.exists() ? (snap.data() as Partial<ScreenCustomLayout>) : null;
      const resolved = mergeScreenLayout(defaults, remote, companyId);
      if (remote) {
        writeCache(companyId, screenId, {
          ...defaults,
          ...remote,
          screenId,
          companyId,
        } as ScreenCustomLayout);
      }
      onLayout(resolved);
    },
    err => {
      console.error(`subscribeScreenLayout(${screenId})`, err);
      onError?.(err);
      const cached = readCache(companyId, screenId);
      onLayout(mergeScreenLayout(defaults, cached, companyId));
    }
  );
}

/** Super Admin only — enforced in UI and Firestore rules */
export async function saveScreenLayout(
  companyId: string,
  screenId: ScreenId,
  layout: ScreenCustomLayout,
  updatedBy?: string
): Promise<ScreenCustomLayout> {
  const payload: ScreenCustomLayout = {
    ...layout,
    screenId,
    companyId,
    version: (layout.version || 0) + 1,
    updatedAt: new Date().toISOString(),
    updatedBy,
    publishedAt: new Date().toISOString(),
  };

  await setDoc(layoutDocRef(companyId, screenId), cleanFirestoreData(payload as Record<string, unknown>), {
    merge: true,
  });
  writeCache(companyId, screenId, payload);
  return payload;
}
