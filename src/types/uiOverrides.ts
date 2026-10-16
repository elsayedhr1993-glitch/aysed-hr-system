import type { LocalizedLabel } from './customLayout';

export type UiElementKind =
  | 'app'
  | 'tab'
  | 'field'
  | 'label'
  | 'help'
  | 'column'
  | 'section';

export interface UiElementOverride {
  key: string;
  kind?: UiElementKind;
  label?: LocalizedLabel;
  help?: LocalizedLabel;
  order?: number;
  hidden?: boolean;
  /** Launcher tile icon key. Display only. */
  icon?: string;
  /** Launcher group id. Display only. */
  group?: string;
  /** Stored launcher permission. Opening an app does not read this value. */
  permission?: string;
  /** Studio cannot hide (payroll totals, legal notices, etc.) */
  locked?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UiOverridesDocument {
  companyId: string;
  version: number;
  elements: Record<string, UiElementOverride>;
  updatedAt: string;
  updatedBy?: string;
}

export interface UiElementDefaults {
  kind?: UiElementKind;
  label: LocalizedLabel;
  help?: LocalizedLabel;
  order?: number;
  locked?: boolean;
}

export interface ResolvedUiElement {
  key: string;
  label: LocalizedLabel;
  help?: LocalizedLabel;
  order: number;
  hidden: boolean;
  locked: boolean;
}
