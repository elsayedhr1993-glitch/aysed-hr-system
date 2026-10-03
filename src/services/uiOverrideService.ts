import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import type { UiElementOverride, UiOverridesDocument } from '../types/uiOverrides';
import { UI_OVERRIDES_DOC_ID, mergeUiOverridesDoc, uiOverridesCacheKey } from '../utils/uiOverrideUtils';

function overridesDocRef(companyId: string) {
  return doc(db, 'companies', companyId, 'ui_overrides', UI_OVERRIDES_DOC_ID);
}

function readCache(companyId: string): Partial<UiOverridesDocument> | null {
  try {
    const raw = localStorage.getItem(uiOverridesCacheKey(companyId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<UiOverridesDocument>;
  } catch {
    return null;
  }
}

function writeCache(companyId: string, docData: UiOverridesDocument): void {
  try {
    localStorage.setItem(uiOverridesCacheKey(companyId), JSON.stringify(docData));
  } catch {
    /* ignore */
  }
}

export function subscribeUiOverrides(
  companyId: string,
  onData: (doc: UiOverridesDocument) => void,
  onError?: (error: Error) => void
): () => void {
  if (!companyId || companyId === 'SAAS_PLATFORM') {
    onData(mergeUiOverridesDoc(companyId || '', null));
    return () => undefined;
  }

  return onSnapshot(
    overridesDocRef(companyId),
    snap => {
      const remote = snap.exists() ? (snap.data() as Partial<UiOverridesDocument>) : null;
      const merged = mergeUiOverridesDoc(companyId, remote);
      writeCache(companyId, merged);
      onData(merged);
    },
    err => {
      console.error('subscribeUiOverrides', err);
      onError?.(err);
      const cached = readCache(companyId);
      onData(mergeUiOverridesDoc(companyId, cached));
    }
  );
}

export async function patchUiOverrides(
  companyId: string,
  patches: Record<string, Partial<UiElementOverride>>,
  updatedBy?: string,
  current?: UiOverridesDocument
): Promise<UiOverridesDocument> {
  const base = current ?? mergeUiOverridesDoc(companyId, readCache(companyId));
  const nextElements = { ...base.elements };
  const now = new Date().toISOString();

  for (const [key, patch] of Object.entries(patches)) {
    const prev = nextElements[key] || { key };
    nextElements[key] = {
      ...prev,
      ...patch,
      key,
      updatedAt: now,
      updatedBy,
    };
  }

  const payload: UiOverridesDocument = {
    companyId,
    version: (base.version || 0) + 1,
    elements: nextElements,
    updatedAt: now,
    updatedBy,
  };

  await setDoc(overridesDocRef(companyId), cleanFirestoreData(payload as Record<string, unknown>), {
    merge: true,
  });
  writeCache(companyId, payload);
  return payload;
}
