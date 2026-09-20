import type {
  BuiltinFieldLayout,
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
