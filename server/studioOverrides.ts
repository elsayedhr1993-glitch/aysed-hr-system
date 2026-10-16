import { normalizeHrRole } from '../src/security/accessRoles';
import {
  isLauncherGroup,
  isLauncherIcon,
  isLauncherPermission,
  launcherTileById,
  launcherTileIdFromKey,
  resolveLauncherTile,
  type LauncherTileOverride,
} from '../src/config/launcherTiles';
import type { UiElementOverride, UiOverridesDocument } from '../src/types/uiOverrides';
import { mergeUiOverridesDoc } from '../src/utils/uiOverrideUtils';
import { recordAuditEvent } from './auditLog';

export interface StudioOverridesStore {
  read(companyId: string): Promise<UiOverridesDocument | null>;
  write(companyId: string, doc: UiOverridesDocument): Promise<void>;
}

const memoryDocs = new Map<string, UiOverridesDocument>();

const memoryStore: StudioOverridesStore = {
  async read(companyId) {
    const found = memoryDocs.get(companyId);
    return found ? structuredClone(found) : null;
  },
  async write(companyId, doc) {
    memoryDocs.set(companyId, structuredClone(doc));
  },
};

let injectedStore: StudioOverridesStore | null = null;

/**
 * Local development stays in memory, same as the audit log.
 * Production and the emulator append through the Admin SDK.
 * This does not open a .env file.
 */
export function studioPersistenceMode(env: NodeJS.ProcessEnv = process.env): 'memory' | 'firestore' {
  if (env.VITE_USE_EMULATOR === 'true' || env.FIRESTORE_EMULATOR_HOST) return 'firestore';
  if (env.NODE_ENV === 'production' || env.VERCEL) return 'firestore';
  return 'memory';
}

function activeStore(): StudioOverridesStore {
  if (injectedStore) return injectedStore;
  if (studioPersistenceMode() === 'memory') return memoryStore;
  return {
    async read(companyId) {
      const { readStudioOverridesFromFirestore } = await import('./studioFirestoreStore');
      return readStudioOverridesFromFirestore(companyId);
    },
    async write(companyId, doc) {
      const { writeStudioOverridesToFirestore } = await import('./studioFirestoreStore');
      await writeStudioOverridesToFirestore(companyId, doc);
    },
  };
}

export function __setStudioStoreForTests(store: StudioOverridesStore | null): void {
  injectedStore = store;
}

export function __resetStudioStoreForTests(): void {
  memoryDocs.clear();
  injectedStore = memoryStore;
}

const TEXT_LIMIT = 160;

export function studioTargetCompany(input: {
  role?: string | null;
  sessionCompanyId?: string | null;
  impersonatedCompanyId?: string | null;
}): { ok: true; companyId: string } | { ok: false; status: number; error: string } {
  if (normalizeHrRole(input.role) !== 'SUPER_ADMIN') {
    return { ok: false, status: 403, error: 'Unauthorized' };
  }
  const impersonated = String(input.impersonatedCompanyId || '').trim();
  const sessionCompany = String(input.sessionCompanyId || '').trim();
  const companyId = impersonated || sessionCompany;
  if (!companyId || companyId === 'SAAS_PLATFORM') {
    return { ok: false, status: 403, error: 'اختر منشأة من الجلسة' };
  }
  return { ok: true, companyId };
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim().slice(0, TEXT_LIMIT);
  return text || undefined;
}

function sanitizePatch(key: string, raw: unknown): Partial<UiElementOverride> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  const tileId = launcherTileIdFromKey(key);
  if (key.startsWith('launcher.app.') && !tileId) return null;

  const next: Partial<UiElementOverride> = {};
  if (typeof source.kind === 'string') next.kind = source.kind as UiElementOverride['kind'];
  if (source.label && typeof source.label === 'object' && !Array.isArray(source.label)) {
    const label = source.label as Record<string, unknown>;
    const ar = cleanText(label.ar);
    const en = cleanText(label.en);
    if (ar || en) next.label = { ar: ar || en || '', en };
  }
  if (source.help && typeof source.help === 'object' && !Array.isArray(source.help)) {
    const help = source.help as Record<string, unknown>;
    const ar = cleanText(help.ar);
    const en = cleanText(help.en);
    if (ar || en) next.help = { ar: ar || en || '', en };
  }
  if (typeof source.order === 'number' && Number.isFinite(source.order)) {
    next.order = Math.max(0, Math.min(10000, Math.round(source.order)));
  }
  if (typeof source.hidden === 'boolean') next.hidden = source.hidden;
  if (source.locked === true) next.locked = true;

  if (tileId) {
    if (isLauncherIcon(source.icon)) next.icon = source.icon;
    if (isLauncherGroup(source.group)) next.group = source.group;
    if (isLauncherPermission(source.permission)) next.permission = source.permission;
  }

  if (next.locked) next.hidden = false;
  return next;
}

export function studioSnapshot(
  key: string,
  element?: Partial<UiElementOverride> | null
): Record<string, unknown> {
  const tileId = launcherTileIdFromKey(key);
  if (tileId) {
    const resolved = resolveLauncherTile(tileId, element as LauncherTileOverride | null);
    const tile = launcherTileById(tileId);
    return {
      uiKey: key,
      titleAr: resolved?.titleAr || tile?.titleAr || '',
      titleEn: resolved?.titleEn || tile?.titleEn || '',
      icon: resolved?.icon || tile?.icon || '',
      group: resolved?.group || tile?.group || '',
      order: resolved?.order ?? tile?.order ?? 0,
      hidden: Boolean(element?.hidden),
      permission: resolved?.storedPermission || tile?.permission || 'staff',
    };
  }
  return {
    uiKey: key,
    titleAr: element?.label?.ar || '',
    titleEn: element?.label?.en || '',
    order: element?.order ?? 0,
    hidden: Boolean(element?.hidden),
  };
}

async function loadDoc(companyId: string): Promise<UiOverridesDocument> {
  const remote = await activeStore().read(companyId);
  return mergeUiOverridesDoc(companyId, remote);
}

async function persist(
  companyId: string,
  doc: UiOverridesDocument
): Promise<UiOverridesDocument> {
  await activeStore().write(companyId, doc);
  return doc;
}

export async function saveStudioOverrides(input: {
  role?: string | null;
  uid?: string;
  email?: string;
  sessionCompanyId?: string | null;
  impersonatedCompanyId?: string | null;
  patches: unknown;
  ip?: string;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const target = studioTargetCompany(input);
  if (target.ok === false) return { status: target.status, body: { success: false, error: target.error } };
  if (!input.patches || typeof input.patches !== 'object' || Array.isArray(input.patches)) {
    return { status: 400, body: { success: false, error: 'لا توجد تعديلات' } };
  }
  const entries = Object.entries(input.patches as Record<string, unknown>);
  if (entries.length === 0 || entries.length > 80) {
    return { status: 400, body: { success: false, error: 'لا توجد تعديلات' } };
  }

  const current = await loadDoc(target.companyId);
  const nextElements = { ...current.elements };
  const changes: Array<{ key: string; before: Record<string, unknown>; after: Record<string, unknown> }> = [];

  for (const [key, raw] of entries) {
    const patch = sanitizePatch(key, raw);
    if (!patch) return { status: 400, body: { success: false, error: 'عنصر غير معروف' } };
    const prev = nextElements[key];
    if (prev?.locked) patch.hidden = false;
    const before = studioSnapshot(key, prev);
    const merged: UiElementOverride = {
      ...prev,
      ...patch,
      key,
      updatedAt: new Date().toISOString(),
      updatedBy: input.email || input.uid,
    };
    nextElements[key] = merged;
    changes.push({ key, before, after: studioSnapshot(key, merged) });
  }

  const saved = await persist(target.companyId, {
    companyId: target.companyId,
    version: (current.version || 0) + 1,
    elements: nextElements,
    updatedAt: new Date().toISOString(),
    updatedBy: input.email || input.uid,
  });

  for (const change of changes) {
    await recordAuditEvent({
      actor: { uid: input.uid, name: input.email || input.uid, role: 'SUPER_ADMIN' },
      action: 'customization',
      entityType: 'ui_override',
      entityId: change.key,
      before: change.before,
      after: change.after,
      ip: input.ip,
      sessionCompanyId: target.companyId,
      details: `تعديل ${change.key}`,
    });
  }

  return {
    status: 200,
    body: { success: true, companyId: target.companyId, document: saved },
  };
}

export async function resetStudioOverride(input: {
  role?: string | null;
  uid?: string;
  email?: string;
  sessionCompanyId?: string | null;
  impersonatedCompanyId?: string | null;
  key: unknown;
  ip?: string;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const target = studioTargetCompany(input);
  if (target.ok === false) return { status: target.status, body: { success: false, error: target.error } };
  const key = String(input.key || '').trim();
  if (!key || key.length > 180) return { status: 400, body: { success: false, error: 'عنصر غير معروف' } };
  if (key.startsWith('launcher.app.') && !launcherTileIdFromKey(key)) {
    return { status: 400, body: { success: false, error: 'عنصر غير معروف' } };
  }

  const current = await loadDoc(target.companyId);
  const prev = current.elements[key];
  const before = studioSnapshot(key, prev);
  const nextElements = { ...current.elements };
  delete nextElements[key];
  const saved = await persist(target.companyId, {
    companyId: target.companyId,
    version: (current.version || 0) + 1,
    elements: nextElements,
    updatedAt: new Date().toISOString(),
    updatedBy: input.email || input.uid,
  });
  await recordAuditEvent({
    actor: { uid: input.uid, name: input.email || input.uid, role: 'SUPER_ADMIN' },
    action: 'customization',
    entityType: 'ui_override',
    entityId: key,
    before,
    after: studioSnapshot(key, null),
    ip: input.ip,
    sessionCompanyId: target.companyId,
    details: 'استعادة الافتراضي',
  });
  return {
    status: 200,
    body: { success: true, companyId: target.companyId, document: saved },
  };
}
