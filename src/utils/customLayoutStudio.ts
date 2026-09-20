import type {
  CustomFieldLayout,
  CustomFieldType,
  ResolvedScreenLayout,
  ScreenCustomLayout,
} from '../types/customLayout';
import { slugifyStorageKey } from './customLayoutUtils';

/** Strip resolved-only fields before save or draft editing */
export function toEditableScreenLayout(resolved: ResolvedScreenLayout): ScreenCustomLayout {
  return {
    screenId: resolved.screenId,
    companyId: resolved.companyId,
    version: resolved.version,
    tabs: resolved.tabs.map(tab => ({ ...tab })),
    fields: resolved.fields.map(field => ({ ...field })),
    customFields: resolved.customFields.map(field => ({ ...field })),
    updatedAt: resolved.updatedAt,
    updatedBy: resolved.updatedBy,
    publishedAt: resolved.publishedAt,
  };
}

export function createCustomFieldDraft(
  tabId: string,
  order: number,
  type: CustomFieldType = 'text'
): CustomFieldLayout {
  const suffix = Date.now().toString(36);
  const storageKey = `custom_${suffix}`;
  return {
    id: `cf_${suffix}`,
    kind: 'custom',
    tabId,
    order,
    type,
    storageKey,
    label: { ar: 'حقل مخصص جديد', en: 'New custom field' },
    hidden: false,
    required: false,
  };
}

export function ensureUniqueStorageKey(
  storageKey: string,
  fields: CustomFieldLayout[],
  selfId: string
): string {
  let key = slugifyStorageKey(storageKey);
  if (!key.startsWith('custom_')) key = `custom_${key}`;
  const taken = new Set(fields.filter(f => f.id !== selfId).map(f => f.storageKey));
  if (!taken.has(key)) return key;
  let i = 2;
  while (taken.has(`${key}_${i}`)) i += 1;
  return `${key}_${i}`;
}

export function reorderTabs<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, order: index + 1 }));
}
