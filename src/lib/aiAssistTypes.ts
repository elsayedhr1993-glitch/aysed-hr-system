export type AiAssistMode = 'chat' | 'generate' | 'summarize';

export type AiFieldKind =
  | 'admin_decision'
  | 'employee_notice'
  | 'contract_clause'
  | 'leave_reason'
  | 'hr_notes'
  | 'general';

export const AI_FIELD_KIND_LABELS: Record<AiFieldKind, string> = {
  admin_decision: 'قرار إداري',
  employee_notice: 'إشعار للموظف',
  contract_clause: 'بند عقد',
  leave_reason: 'سبب إجازة',
  hr_notes: 'ملاحظات إدارية',
  general: 'نص عام',
};

export function normalizeAiFieldKind(raw?: string): AiFieldKind {
  const k = String(raw || 'general').trim() as AiFieldKind;
  if (k in AI_FIELD_KIND_LABELS) return k;
  return 'general';
}
