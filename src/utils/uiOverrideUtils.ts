import type {
  ResolvedUiElement,
  UiElementDefaults,
  UiElementOverride,
  UiOverridesDocument,
} from '../types/uiOverrides';
import type { LayoutLocale } from '../types/customLayout';

export const UI_OVERRIDES_DOC_ID = 'global';

export function uiOverridesCacheKey(companyId: string): string {
  return `aysed_ui_overrides_${companyId}`;
}

export function resolveUiElement(
  key: string,
  defaults: UiElementDefaults,
  override?: UiElementOverride | null
): ResolvedUiElement {
  const locked = Boolean(defaults.locked || override?.locked);
  const hidden = locked ? false : Boolean(override?.hidden);
  return {
    key,
    label: {
      ar: override?.label?.ar?.trim() || defaults.label.ar,
      en: override?.label?.en?.trim() || defaults.label.en || defaults.label.ar,
    },
    help: override?.help || defaults.help,
    order: override?.order ?? defaults.order ?? 0,
    hidden,
    locked,
  };
}

export function pickUiLabel(resolved: ResolvedUiElement, locale: LayoutLocale): string {
  if (locale === 'en') return resolved.label.en || resolved.label.ar;
  return resolved.label.ar;
}

export function pickUiHelp(resolved: ResolvedUiElement, locale: LayoutLocale): string | undefined {
  if (!resolved.help) return undefined;
  if (locale === 'en') return resolved.help.en || resolved.help.ar;
  return resolved.help.ar;
}

export function mergeUiOverridesDoc(
  companyId: string,
  remote: Partial<UiOverridesDocument> | null | undefined
): UiOverridesDocument {
  return {
    companyId,
    version: remote?.version ?? 0,
    elements: remote?.elements ?? {},
    updatedAt: remote?.updatedAt ?? '',
    updatedBy: remote?.updatedBy,
  };
}

export function sortByUiOrder<T extends { uiKey: string; baseOrder: number }>(
  items: T[],
  elements: Record<string, UiElementOverride>
): T[] {
  return [...items].sort((a, b) => {
    const ao = elements[a.uiKey]?.order ?? a.baseOrder;
    const bo = elements[b.uiKey]?.order ?? b.baseOrder;
    if (ao !== bo) return ao - bo;
    return a.baseOrder - b.baseOrder;
  });
}

export function filterVisibleUi<T extends { uiKey: string; locked?: boolean }>(
  items: T[],
  resolve: (key: string) => ResolvedUiElement
): T[] {
  return items.filter(item => {
    const r = resolve(item.uiKey);
    if (item.locked || r.locked) return true;
    return !r.hidden;
  });
}
