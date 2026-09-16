export const ONBOARDING_STEPS = [
  'IDLE',
  'CIVIL_ID_UPLOADED',
  'CIVIL_ID_VERIFIED',
  'ASK_JOB',
  'ASK_DEPARTMENT',
  'ASK_JOIN_DATE',
  'ASK_BASIC_SALARY',
  'ASK_ALLOWANCES',
  'REVIEW',
  'CONFIRMED',
  'CREATED',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface DraftEmployee {
  companyId: string;
  civilId?: string;
  nameAr?: string;
  nameEn?: string;
  birthDate?: string;
  nationality?: string;
  civilIdExpiry?: string;
  jobTitle?: string;
  department?: string;
  joinDate?: string;
  basicSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  otherAllowance?: number;
  onboardingStep: OnboardingStep;
}

export function createDraftEmployee(companyId: string): DraftEmployee {
  return {
    companyId,
    onboardingStep: 'IDLE',
  };
}

export function advanceOnboardingState(
  draft: DraftEmployee,
  nextStep: OnboardingStep | string,
): DraftEmployee {
  if (!ONBOARDING_STEPS.includes(nextStep as OnboardingStep)) {
    return { ...draft, onboardingStep: draft.onboardingStep };
  }

  return { ...draft, onboardingStep: nextStep as OnboardingStep };
}

export function validateDraftEmployee(draft: DraftEmployee): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!draft.companyId) {
    errors.push('يجب تحديد الشركة النشطة قبل الحفظ.');
  }

  if (!draft.civilId || !/^\d{12}$/.test(String(draft.civilId))) {
    errors.push('الرقم المدني يجب أن يكون 12 رقمًا صحيحًا.');
  }

  if (!draft.nameAr || !draft.nameAr.trim()) {
    errors.push('اسم الموظف بالعربية مطلوب.');
  }

  if (!draft.jobTitle || !draft.jobTitle.trim()) {
    errors.push('المسمى الوظيفي مطلوب.');
  }

  if (!draft.department || !draft.department.trim()) {
    errors.push('القسم مطلوب.');
  }

  if (!draft.joinDate) {
    errors.push('تاريخ المباشرة مطلوب.');
  }

  if (typeof draft.basicSalary !== 'number' || Number(draft.basicSalary) <= 0) {
    errors.push('الراتب الأساسي يجب أن يكون رقمًا موجبًا.');
  }

  if (draft.housingAllowance !== undefined && draft.housingAllowance < 0) {
    errors.push('بدل السكن لا يمكن أن يكون سالبًا.');
  }

  if (draft.transportAllowance !== undefined && draft.transportAllowance < 0) {
    errors.push('بدل النقل لا يمكن أن يكون سالبًا.');
  }

  if (draft.otherAllowance !== undefined && draft.otherAllowance < 0) {
    errors.push('البدلات الأخرى لا يمكن أن تكون سالبة.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
