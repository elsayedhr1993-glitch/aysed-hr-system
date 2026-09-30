import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import type { EmployeeOnboardingChecklistDoc, EmployeeOnboardingStep } from '../types';

export const EMPLOYEE_ONBOARDING_CHECKLIST_ID = 'checklist';

export const DEFAULT_EMPLOYEE_ONBOARDING_STEPS: Omit<EmployeeOnboardingStep, 'completed' | 'completedAt'>[] = [
  { id: 'contract_sign', title: 'توقيع العقد', order: 1 },
  { id: 'moh_pam', title: 'ترخيص MOH / PAM', order: 2 },
  { id: 'medical_residency', title: 'الفحص والإقامة', order: 3 },
  { id: 'wps_bank', title: 'بنك WPS', order: 4 },
  { id: 'biometrics_custody', title: 'البصمة والعهد', order: 5 },
];

export function computeOnboardingProgress(steps: EmployeeOnboardingStep[]): number {
  if (!steps.length) return 0;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / steps.length) * 100);
}

function inferStepCompletion(stepId: string, employee: Record<string, unknown>): boolean {
  switch (stepId) {
    case 'contract_sign':
      return Boolean(
        employee.contractId ||
          employee.pamContractId ||
          employee.contractStartDate ||
          employee.signedContractUrl ||
          employee.contractRef
      );
    case 'moh_pam':
      return Boolean(employee.mohLicense || employee.mohLicenseNo || employee.pamWorkPermitNo);
    case 'medical_residency':
      return Boolean(
        employee.civilIdExpiry || employee.civilIdExpiryDate || employee.residencyExpiry || employee.medicalFitnessStatus
      );
    case 'wps_bank':
      return Boolean(employee.iban || employee.iban_number);
    case 'biometrics_custody':
      return Boolean(
        (Array.isArray(employee.custodyItems) && employee.custodyItems.length > 0) ||
          employee.workBadgeNo ||
          employee.badgeId
      );
    default:
      return false;
  }
}

export function mergeStepsWithEmployee(
  stored: EmployeeOnboardingStep[] | undefined,
  employee: Record<string, unknown>
): EmployeeOnboardingStep[] {
  const byId = new Map((stored || []).map((s) => [s.id, s]));
  return DEFAULT_EMPLOYEE_ONBOARDING_STEPS.map((def) => {
    const existing = byId.get(def.id);
    const inferred = inferStepCompletion(def.id, employee);
    const completed = existing?.completed ?? inferred;
    return {
      ...def,
      completed,
      completedAt: existing?.completedAt || (completed && inferred ? new Date().toISOString().slice(0, 10) : undefined),
      notes: existing?.notes,
    };
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
    version: 1,
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
  const payload: EmployeeOnboardingChecklistDoc = {
    ...checklist,
    progressPercent: computeOnboardingProgress(checklist.steps),
    updatedAt: new Date().toISOString(),
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
  const steps = checklist.steps.map((s) =>
    s.id === stepId
      ? {
          ...s,
          completed,
          completedAt: completed ? new Date().toISOString().slice(0, 10) : null,
        }
      : s
  );
  const next = { ...checklist, steps, progressPercent: computeOnboardingProgress(steps) };
  await persistEmployeeOnboardingChecklist(next);
  return next;
}
