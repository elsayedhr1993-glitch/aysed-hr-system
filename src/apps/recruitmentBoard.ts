export const RECRUITMENT_STAGES = [
  { id: 'INITIAL', label: 'الفرز الأولي' },
  { id: 'INTERVIEW', label: 'المقابلة' },
  { id: 'QUALIFIED', label: 'المؤهلون' },
  { id: 'CONTRACT', label: 'العرض الوظيفي' },
  { id: 'HIRED', label: 'تم التعيين' },
] as const;

export type RecruitmentStageId = (typeof RECRUITMENT_STAGES)[number]['id'];

const LATIN = /[A-Za-z]/;

export function recruitmentStageLabel(id: string): string {
  return RECRUITMENT_STAGES.find((stage) => stage.id === id)?.label || '';
}

export function recruitmentStageTabs(): readonly string[] {
  return [];
}

export function recruitmentPageEmpty(count: number): boolean {
  return count === 0;
}

export function dropOnRecruitmentStage(stageId: string): 'confirm-hire' | 'move' {
  return stageId === 'HIRED' ? 'confirm-hire' : 'move';
}

/** Moving into تم التعيين changes the stage only. It does not create an employee. */
export function hireStageDecision(): { stage: 'HIRED'; createEmployee: false } {
  return { stage: 'HIRED', createEmployee: false };
}

export function attachmentAuditEvent(kind: 'view' | 'download', attachmentId: string) {
  return {
    action: 'view_sensitive' as const,
    entityType: 'candidate_attachment',
    entityId: attachmentId,
    details: kind === 'download' ? 'تنزيل مرفق متقدم' : 'عرض مرفق متقدم',
  };
}

export function stagesAreArabicOnly(): boolean {
  return RECRUITMENT_STAGES.length === 5 && RECRUITMENT_STAGES.every((stage) => !LATIN.test(stage.label));
}
