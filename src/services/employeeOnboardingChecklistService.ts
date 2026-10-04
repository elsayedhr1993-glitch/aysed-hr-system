import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import type {
  EmployeeOnboardingChecklistDoc,
  EmployeeOnboardingStep,
  EmployeeOnboardingTaskStatus,
} from '../types';

export const EMPLOYEE_ONBOARDING_CHECKLIST_ID = 'checklist';
export const EMPLOYEE_ONBOARDING_CHECKLIST_VERSION = 2;

export const DEFAULT_EMPLOYEE_ONBOARDING_STEPS: Omit<
  EmployeeOnboardingStep,
  'completed' | 'completedAt' | 'status'
>[] = [
  {
    id: 'contract_pam',
    title: 'توقيع عقد العمل ومطابقته مع PAM',
    titleEn: 'Employment contract & PAM alignment',
    description: 'عقد موقّع ومطابق لملف الشؤون (PAM) والراتب المعتمد.',
    responsible: 'الموارد البشرية / الشؤون',
    order: 1,
  },
  {
    id: 'moh_medical_commence',
    title: 'بطاقة العمل، الفحص الطبي، ومزاولة المهنة (MOH)',
    titleEn: 'Work permit, medical & MOH commencement',
    description: 'إصدار بطاقة العمل، حجز الفحص الطبي، وإقرار مزاولة المهنة.',
    responsible: 'الشؤون الطبية / الامتثال',
    order: 2,
  },
  {
    id: 'custody_biometrics',
    title: 'تسليم العهدة وتسجيل بصمة الحضور',
    titleEn: 'Custody handover & attendance biometrics',
    description: 'تسليم العهدة (إن وجدت) وتسجيل الموظف على أجهزة البصمة.',
    responsible: 'الإدارة / تقنية المعلومات',
    order: 3,
  },
  {
    id: 'probation_100d',
    title: 'تقييم فترة التجربة (قبل 100 يوم عمل)',
    titleEn: 'Probation review (before 100 working days)',
    description: 'مراجعة الأداء واعتماد التثبيت قبل انتهاء فترة التجربة.',
    responsible: 'المدير المباشر / HR',
    order: 4,
  },
];

const LEGACY_STEP_IDS = ['contract_sign', 'moh_pam', 'medical_residency', 'wps_bank', 'biometrics_custody'];

function addCalendarDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function resolveDueDates(employee: Record<string, unknown>): Record<string, string> {
  const join =
    String(employee.joinDate || employee.commencementDate || employee.startDate || '').slice(0, 10) ||
    new Date().toISOString().slice(0, 10);
  return {
    contract_pam: addCalendarDays(join, 7),
    moh_medical_commence: addCalendarDays(join, 21),
    custody_biometrics: addCalendarDays(join, 14),
    probation_100d: addCalendarDays(join, 100),
  };
}

export function computeOnboardingProgress(steps: EmployeeOnboardingStep[]): number {
  if (!steps.length) return 0;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / steps.length) * 100);
}

function taskStatus(step: EmployeeOnboardingStep): EmployeeOnboardingTaskStatus {
  if (step.completed) return 'completed';
  const due = step.dueDate;
  if (due && due < new Date().toISOString().slice(0, 10)) return 'overdue';
  return 'pending';
}

function inferStepCompletion(stepId: string, employee: Record<string, unknown>): boolean {
  switch (stepId) {
    case 'contract_pam':
    case 'contract_sign':
      return Boolean(
        employee.contractId ||
          employee.pamContractId ||
          employee.contractStartDate ||
          employee.signedContractUrl ||
          employee.contractRef
      );
    case 'moh_medical_commence':
    case 'moh_pam':
    case 'medical_residency':
      return Boolean(
        employee.mohLicense ||
          employee.mohLicenseNo ||
          employee.pamWorkPermitNo ||
          employee.commencementApproved ||
          employee.medicalFitnessStatus
      );
    case 'custody_biometrics':
    case 'biometrics_custody':
    case 'wps_bank':
      return Boolean(
        (Array.isArray(employee.custodyItems) && employee.custodyItems.length > 0) ||
          employee.workBadgeNo ||
          employee.badgeId ||
          employee.biometricEnrolled
      );
    case 'probation_100d':
      return Boolean(employee.probationReviewCompleted || employee.probationCleared);
    default:
      return false;
  }
}

export function mergeStepsWithEmployee(
  stored: EmployeeOnboardingStep[] | undefined,
  employee: Record<string, unknown>
): EmployeeOnboardingStep[] {
  const dueDates = resolveDueDates(employee);
  const useStored = stored?.length && !stored.some((s) => LEGACY_STEP_IDS.includes(s.id));
  const byId = new Map((useStored ? stored : []).map((s) => [s.id, s]));

  return DEFAULT_EMPLOYEE_ONBOARDING_STEPS.map((def) => {
    const existing = byId.get(def.id);
    const inferred = inferStepCompletion(def.id, employee);
    const completed = existing?.completed ?? inferred;
    const dueDate = existing?.dueDate || dueDates[def.id] || null;
    const base: EmployeeOnboardingStep = {
      ...def,
      completed,
      dueDate,
      completedAt:
        existing?.completedAt || (completed && inferred ? new Date().toISOString().slice(0, 10) : undefined),
      notes: existing?.notes,
      status: 'pending',
    };
    base.status = taskStatus(base);
    return base;
  });
}

export function buildChecklistDoc(
  employeeId: string,
  companyId: string,
  employee: Record<string, unknown>,
  stored?: EmployeeOnboardingChecklistDoc | null
): EmployeeOnboardingChecklistDoc {
  const steps = mergeStepsWithEmployee(stored?.steps, employee);
  return {
    id: EMPLOYEE_ONBOARDING_CHECKLIST_ID,
    companyId,
    employeeId,
    steps,
    progressPercent: computeOnboardingProgress(steps),
    updatedAt: new Date().toISOString(),
    version: EMPLOYEE_ONBOARDING_CHECKLIST_VERSION,
  };
}

export function subscribeEmployeeOnboardingChecklist(
  employeeId: string,
  companyId: string,
  employee: Record<string, unknown>,
  onData: (doc: EmployeeOnboardingChecklistDoc) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'employees', employeeId, 'onboarding', EMPLOYEE_ONBOARDING_CHECKLIST_ID);
  return onSnapshot(
    ref,
    (snap) => {
      const stored = snap.exists() ? (snap.data() as EmployeeOnboardingChecklistDoc) : null;
      onData(buildChecklistDoc(employeeId, companyId, employee, stored));
    },
    (error) => {
      console.error('employee onboarding checklist subscribe failed:', error);
      onError?.(error);
      onData(buildChecklistDoc(employeeId, companyId, employee, null));
    }
  );
}

export async function persistEmployeeOnboardingChecklist(
  checklist: EmployeeOnboardingChecklistDoc
): Promise<void> {
  const steps = checklist.steps.map((s) => ({ ...s, status: taskStatus(s) }));
  const payload: EmployeeOnboardingChecklistDoc = {
    ...checklist,
    steps,
    progressPercent: computeOnboardingProgress(steps),
    updatedAt: new Date().toISOString(),
    version: EMPLOYEE_ONBOARDING_CHECKLIST_VERSION,
  };
  await setDoc(
    doc(db, 'employees', checklist.employeeId, 'onboarding', EMPLOYEE_ONBOARDING_CHECKLIST_ID),
    cleanFirestoreData(payload),
    { merge: true }
  );
}

export async function toggleEmployeeOnboardingStep(
  checklist: EmployeeOnboardingChecklistDoc,
  stepId: string,
  completed: boolean
): Promise<EmployeeOnboardingChecklistDoc> {
  const steps = checklist.steps.map((s) => {
    if (s.id !== stepId) return { ...s, status: taskStatus(s) };
    const next = {
      ...s,
      completed,
      completedAt: completed ? new Date().toISOString().slice(0, 10) : null,
    };
    return { ...next, status: taskStatus(next) };
  });
  const next = { ...checklist, steps, progressPercent: computeOnboardingProgress(steps) };
  await persistEmployeeOnboardingChecklist(next);
  return next;
}
