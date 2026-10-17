import { doc, onSnapshot } from 'firebase/firestore';
import { db, getCompaniesCollectionName } from '../lib/firebase';
import type { UiElementOverride, UiOverridesDocument } from '../types/uiOverrides';
import { UI_OVERRIDES_DOC_ID, mergeUiOverridesDoc, uiOverridesCacheKey } from '../utils/uiOverrideUtils';

function overridesDocRef(companyId: string) {
  const collectionName = getCompaniesCollectionName();
  return doc(db, collectionName, companyId, 'ui_overrides', UI_OVERRIDES_DOC_ID);
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

async function postStudio(
  path: string,
  body: Record<string, unknown>,
  viewedCompanyId: string
): Promise<UiOverridesDocument> {
  const { buildAuthedJsonHeaders } = await import('../lib/clientAuth');
  const headers = await buildAuthedJsonHeaders();
  const response = await fetch(path, {
    method: path.endsWith('/reset') ? 'POST' : 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'فشل حفظ التخصيص');
  }
  const savedCompany = String(payload?.companyId || '');
  if (viewedCompanyId && savedCompany && savedCompany !== viewedCompanyId) {
    throw new Error('الحفظ يتبع منشأة الجلسة على الخادم');
  }
  const document = mergeUiOverridesDoc(savedCompany || viewedCompanyId, payload?.document);
  writeCache(document.companyId, document);
  return document;
}

/** Save goes through the server. The browser does not write ui_overrides. */
export async function patchUiOverrides(
  companyId: string,
  patches: Record<string, Partial<UiElementOverride>>,
  _updatedBy?: string,
  _current?: UiOverridesDocument
): Promise<UiOverridesDocument> {
  return postStudio('/api/platform/ui-overrides', { patches, companyId }, companyId);
}

export async function resetUiOverride(companyId: string, key: string): Promise<UiOverridesDocument> {
  return postStudio('/api/platform/ui-overrides/reset', { key, companyId }, companyId);
}
