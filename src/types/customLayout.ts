/** Screen identifiers — align with App modules and optional nested screens */
export type ScreenId =
  | 'employees'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'contracts'
  | 'recruitment'
  | 'custody'
  | 'archive'
  | string;

export type LayoutLocale = 'ar' | 'en';

export interface LocalizedLabel {
  ar: string;
  en?: string;
}

export interface LayoutTabDefinition {
  /** Stable key used in code — never renamed via Studio */
  id: string;
  label: LocalizedLabel;
  order: number;
  visible: boolean;
  /** When true, Studio cannot hide this tab (critical flows) */
  locked?: boolean;
  icon?: string;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'textarea';

export interface FieldLayoutBase {
  id: string;
  tabId: string;
  order: number;
  label: LocalizedLabel;
  hidden: boolean;
  required: boolean;
  readOnly?: boolean;
  helpText?: LocalizedLabel;
}

export interface BuiltinFieldLayout extends FieldLayoutBase {
  kind: 'builtin';
  dataPath: string;
  studioEditable?: boolean;
}

export interface CustomFieldLayout extends FieldLayoutBase {
  kind: 'custom';
  type: CustomFieldType;
  storageKey: string;
  options?: { value: string; label: LocalizedLabel }[];
  defaultValue?: string | number | boolean | null;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
}

export type FieldLayoutDefinition = BuiltinFieldLayout | CustomFieldLayout;

export interface ScreenCustomLayout {
  screenId: ScreenId;
  companyId: string;
  version: number;
  tabs: LayoutTabDefinition[];
  fields: BuiltinFieldLayout[];
  customFields: CustomFieldLayout[];
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string;
}

export interface ResolvedScreenLayout extends ScreenCustomLayout {
  visibleTabs: LayoutTabDefinition[];
  fieldsByTab: Record<string, FieldLayoutDefinition[]>;
}

export interface CustomDataBag {
  [storageKey: string]: string | number | boolean | null | undefined;
}

export interface WithCustomData {
  customData?: CustomDataBag;
}
