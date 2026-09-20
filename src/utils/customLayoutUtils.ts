import type {
  BuiltinFieldLayout,
  CustomDataBag,
  CustomFieldLayout,
  FieldLayoutDefinition,
  LayoutLocale,
  LayoutTabDefinition,
  LocalizedLabel,
  ResolvedScreenLayout,
  ScreenCustomLayout,
} from '../types/customLayout';

export function resolveLabel(label: LocalizedLabel, locale: LayoutLocale): string {
  if (locale === 'en' && label.en) return label.en;
  return label.ar;
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function mergeTabs(
  defaults: LayoutTabDefinition[],
  remote: LayoutTabDefinition[] | undefined
): LayoutTabDefinition[] {
  const remoteById = new Map((remote || []).map(tab => [tab.id, tab]));
  const merged: LayoutTabDefinition[] = [];

  for (const def of defaults) {
    const over = remoteById.get(def.id);
    if (over) {
      merged.push({
        ...def,
        ...over,
        id: def.id,
        locked: def.locked,
        visible: def.locked ? true : over.visible ?? def.visible,
      });
      remoteById.delete(def.id);
    } else {
      merged.push(def);
    }
  }

  for (const extra of remoteById.values()) {
    merged.push(extra);
  }

  return sortByOrder(merged);
}

function mergeBuiltinFields(
  defaults: BuiltinFieldLayout[],
  remote: BuiltinFieldLayout[] | undefined
): BuiltinFieldLayout[] {
  const remoteById = new Map((remote || []).map(f => [f.id, f]));
  const merged: BuiltinFieldLayout[] = [];

  for (const def of defaults) {
    const over = remoteById.get(def.id);
    if (over && def.studioEditable !== false) {
      merged.push({
        ...def,
        ...over,
        id: def.id,
        kind: 'builtin',
        dataPath: def.dataPath,
      });
      remoteById.delete(def.id);
    } else {
      merged.push(def);
    }
  }

  return sortByOrder(merged);
}

export function mergeScreenLayout(
  defaults: ScreenCustomLayout,
  remote: Partial<ScreenCustomLayout> | null | undefined,
  companyId: string
): ResolvedScreenLayout {
  const tabs = mergeTabs(defaults.tabs, remote?.tabs);
  const fields = mergeBuiltinFields(defaults.fields, remote?.fields);
  const customFields = sortByOrder<CustomFieldLayout>(remote?.customFields || []);

  const visibleTabs = tabs.filter(tab => tab.visible);
  const allFields: FieldLayoutDefinition[] = [...fields, ...customFields];
  const fieldsByTab: Record<string, FieldLayoutDefinition[]> = {};

  for (const field of sortByOrder(allFields)) {
    if (field.hidden) continue;
    if (!fieldsByTab[field.tabId]) fieldsByTab[field.tabId] = [];
    fieldsByTab[field.tabId].push(field);
  }

  return {
    screenId: defaults.screenId,
    companyId,
    version: remote?.version ?? defaults.version,
    tabs,
    fields,
    customFields,
    updatedAt: remote?.updatedAt ?? defaults.updatedAt,
    updatedBy: remote?.updatedBy,
    publishedAt: remote?.publishedAt,
    visibleTabs,
    fieldsByTab,
  };
}

export function layoutCacheKey(companyId: string, screenId: string): string {
  return `custom_layout_${companyId}_${screenId}`;
}

export function slugifyStorageKey(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || `field_${Date.now()}`;
}

export function pickAllowedCustomData(
  customData: CustomDataBag | undefined,
  fields: CustomFieldLayout[]
): CustomDataBag {
  const allowed = new Set(fields.map(f => f.storageKey));
  const out: CustomDataBag = {};
  for (const field of fields) {
    const key = field.storageKey;
    if (!allowed.has(key)) continue;
    const raw = customData?.[key];
    out[key] = raw === undefined ? (field.defaultValue ?? null) : raw;
  }
  return out;
}

export function validateCustomFieldValue(field: CustomFieldLayout, value: unknown): string | null {
  const empty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');
  if (field.required && empty) {
    return 'هذا الحقل مطلوب';
  }
  if (empty) return null;

  if (field.type === 'number') {
    const num = Number(value);
    if (Number.isNaN(num)) return 'أدخل رقماً صالحاً';
    if (field.validation?.min != null && num < field.validation.min) {
      return `الحد الأدنى ${field.validation.min}`;
    }
    if (field.validation?.max != null && num > field.validation.max) {
      return `الحد الأقصى ${field.validation.max}`;
    }
  }

  if (field.type === 'text' || field.type === 'textarea') {
    const str = String(value);
    if (field.validation?.maxLength != null && str.length > field.validation.maxLength) {
      return `الحد الأقصى ${field.validation.maxLength} حرفاً`;
    }
    if (field.validation?.pattern) {
      try {
        if (!new RegExp(field.validation.pattern).test(str)) return 'القيمة لا تطابق النمط المطلوب';
      } catch {
        /* ignore invalid pattern */
      }
    }
  }

  if (field.type === 'select' && field.options?.length) {
    const str = String(value);
    if (!field.options.some(o => o.value === str)) return 'اختر قيمة من القائمة';
  }

  return null;
}
