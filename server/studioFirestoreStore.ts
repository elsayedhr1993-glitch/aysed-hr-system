import type { UiOverridesDocument } from '../src/types/uiOverrides';
import { UI_OVERRIDES_DOC_ID } from '../src/utils/uiOverrideUtils';

function plain(doc: UiOverridesDocument): Record<string, unknown> {
  return {
    companyId: doc.companyId,
    version: doc.version,
    elements: doc.elements,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy || '',
  };
}

/** Admin SDK only. Tests inject a memory store and do not call this. */
export async function readStudioOverridesFromFirestore(companyId: string): Promise<UiOverridesDocument | null> {
  const { getAdminFirestore } = await import('./firebaseAdmin');
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore admin is not available');
  const snap = await db.collection('companies').doc(companyId).collection('ui_overrides').doc(UI_OVERRIDES_DOC_ID).get();
  if (!snap.exists) return null;
  return snap.data() as UiOverridesDocument;
}

export async function writeStudioOverridesToFirestore(companyId: string, doc: UiOverridesDocument): Promise<void> {
  const { getAdminFirestore } = await import('./firebaseAdmin');
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore admin is not available');
  await db.collection('companies').doc(companyId).collection('ui_overrides').doc(UI_OVERRIDES_DOC_ID).set(plain(doc));
}
