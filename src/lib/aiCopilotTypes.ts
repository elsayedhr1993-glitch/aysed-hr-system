export type CopilotActionType =
  | 'NAVIGATE'
  | 'OPEN_MODAL'
  | 'TRIGGER_FUNCTION'
  | 'CREATE_EMPLOYEE'
  | 'OPEN_CALCULATOR';

export const COPILOT_APP_IDS = [
  'switcher',
  'employees',
  'attendance',
  'leaves',
  'payroll',
  'custody',
  'archive',
  'scanner',
  'letters',
  'holidays',
  'reports',
  'moh',
  'audit',
  'contracts',
  'recruitment',
] as const;

export type CopilotAppId = (typeof COPILOT_APP_IDS)[number];

export const COPILOT_MODAL_IDS = ['new_employee', 'pam_contract', 'upload_doc'] as const;
export type CopilotModalId = (typeof COPILOT_MODAL_IDS)[number];

export const COPILOT_FUNCTION_NAMES = ['export_wps', 'export_report'] as const;
export type CopilotFunctionName = (typeof COPILOT_FUNCTION_NAMES)[number];

export interface CopilotEmployeeData {
  nameAr?: string;
  nameEn?: string;
  civilId?: string;
  jobTitle?: string;
  department?: string;
  basicSalary?: string;
  phone?: string;
  nationality?: string;
  email?: string;
  iban?: string;
  bankName?: string;
}

export interface CopilotAction {
  type: CopilotActionType;
  title: string;
  appId?: CopilotAppId;
  modal?: CopilotModalId;
  functionName?: CopilotFunctionName;
  employeeData?: CopilotEmployeeData;
}

export type AiChatSource =
  | `gemini:${string}`
  | 'regex_action'
  | 'unavailable'
  | 'not_configured';

export interface AiChatResponseBody {
  success: boolean;
  reply?: string;
  source?: AiChatSource | string;
  action?: CopilotAction | null;
  error?: string;
  code?: 'AI_NOT_CONFIGURED' | 'AI_UNAVAILABLE' | 'VALIDATION_ERROR' | 'COMPANY_MISMATCH';
}
