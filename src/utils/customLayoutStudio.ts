import type { ResolvedScreenLayout, ScreenCustomLayout } from '../types/customLayout';

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

export function reorderTabs<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, order: index + 1 }));
}
