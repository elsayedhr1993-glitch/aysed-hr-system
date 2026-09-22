import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { OnboardingPlan } from '../types';
import {
  createEmployeeOnboardingBundle,
  EmployeeOnboardingBundle,
} from './employeeOnboardingService';
import { TenantDatabaseService } from './tenantDataService';
import { isEmployeeOnDuty, isEmployeeOnboarding } from '../utils/employeeLifecycle';

export type CanonicalOnboardingPlanStatus = 'active' | 'completed' | 'draft_transient';

/** توحيد حالة الخطة (يدعم سجلات Firestore القديمة بدون status). */
export function normalizeOnboardingPlanStatus(raw?: string | null): CanonicalOnboardingPlanStatus {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'completed' || s === 'complete' || s === 'done') return 'completed';
  if (s === 'draft_transient' || s === 'draft') return 'draft_transient';
  return 'active';
}

export function isOnboardingPlanInProgress(plan: OnboardingPlan): boolean {
  const status = normalizeOnboardingPlanStatus(plan.status);
  return status === 'active' || status === 'draft_transient';
}

export function isOnboardingPlanCompleted(plan: OnboardingPlan): boolean {
  return normalizeOnboardingPlanStatus(plan.status) === 'completed';
}

export function normalizeOnboardingPlanFromFirestore(
  plan: OnboardingPlan,
  companyId: string
): OnboardingPlan {
  const status = normalizeOnboardingPlanStatus(plan.status);
  return {
    ...plan,
    companyId: plan.companyId || companyId,
    status,
    progressPercentage: Number.isFinite(Number(plan.progressPercentage))
      ? Number(plan.progressPercentage)
      : 0,
    tasks: Array.isArray(plan.tasks) ? plan.tasks : [],
  };
}

export function planSubjectKey(plan: OnboardingPlan): string {
  if (plan.employeeId) return `emp:${plan.employeeId}`;
  if (plan.civilId && plan.civilId !== 'غير محدد') return `civil:${plan.civilId}`;
  return `name:${String(plan.employeeName || '').trim()}`;
}

export function findConflictingActivePlan(
  plans: OnboardingPlan[],
  candidate: OnboardingPlan,
  companyId: string
): OnboardingPlan | undefined {
  const subject = planSubjectKey(candidate);
  if (!subject || subject === 'name:') return undefined;
  return plans.find(
    (p) =>
      p.id !== candidate.id &&
      (p.companyId || companyId) === companyId &&
      isOnboardingPlanInProgress(p) &&
      planSubjectKey(p) === subject
  );
}

/** دمج إطلاق خطة جديدة مع خطة نشطة قائمة لنفس الموظف (يمنع التكرار). */
export function coalesceOnboardingPlanLaunch(
  incoming: OnboardingPlan,
  existingPlans: OnboardingPlan[],
  companyId: string
): OnboardingPlan {
  const conflict = findConflictingActivePlan(existingPlans, incoming, companyId);
  const status = isPlanCommencementApproved(incoming) ? 'completed' : 'active';
  if (!conflict) {
    return normalizeOnboardingPlanFromFirestore({ ...incoming, status }, companyId);
  }
  return normalizeOnboardingPlanFromFirestore(
    {
      ...conflict,
      ...incoming,
      id: conflict.id,
      employeeId: incoming.employeeId || conflict.employeeId,
      status,
      updatedAt: new Date().toISOString(),
    },
    companyId
  );
}

/** يكتب status=active في Firestore للخطط القديمة بدون حقل status. */
export async function backfillMissingPlanStatuses(
  rawPlans: Array<{ id: string; data: Record<string, unknown> }>,
  companyId: string
): Promise<void> {
  const patches = rawPlans
    .filter((item) => {
      const raw = item.data.status;
      return raw === undefined || raw === null || String(raw).trim() === '';
    })
    .map((item) =>
      normalizeOnboardingPlanFromFirestore(
        { ...(item.data as OnboardingPlan), id: item.id, status: 'active' },
        companyId
      )
    );
  if (patches.length === 0) return;
  await Promise.all(patches.map((plan) => persistOnboardingPlan(plan, companyId)));
}

/**
 * إزالة خطط التهيئة المكررة لنفس الموظف من Firestore.
 * عند وجود خطة مكتملة يُحتفظ بأحدثها ويُحذف الباقي؛ وإلا تُحفظ أحدث خطة جارية.
 */
export async function reconcileDuplicateOnboardingPlans(
  plans: OnboardingPlan[],
  companyId: string
): Promise<{ plans: OnboardingPlan[]; deletedIds: string[] }> {
  const normalized = plans.map((p) => normalizeOnboardingPlanFromFirestore(p, companyId));
  const groups = new Map<string, OnboardingPlan[]>();

  for (const plan of normalized) {
    const key = planSubjectKey(plan);
    if (!key || key === 'name:') continue;
    const bucket = groups.get(key) || [];
    bucket.push(plan);
    groups.set(key, bucket);
  }

  const deleteIds = new Set<string>();

  for (const bucket of groups.values()) {
    if (bucket.length <= 1) continue;
    const completed = bucket.filter((p) => isOnboardingPlanCompleted(p));
    let keeper: OnboardingPlan;
    if (completed.length > 0) {
      completed.sort((a, b) => String(b.updatedAt || b.id).localeCompare(String(a.updatedAt || a.id)));
      keeper = completed[0];
    } else {
      const inProgress = bucket.filter((p) => isOnboardingPlanInProgress(p));
      const pool = inProgress.length > 0 ? inProgress : bucket;
      pool.sort((a, b) => String(b.updatedAt || b.id).localeCompare(String(a.updatedAt || a.id)));
      keeper = pool[0];
    }
    for (const plan of bucket) {
      if (plan.id !== keeper.id) deleteIds.add(plan.id);
    }
  }

  if (deleteIds.size > 0) {
    await Promise.all([...deleteIds].map((id) => deleteDoc(doc(db, 'onboarding_plans', id))));
  }

  return {
    plans: normalized.filter((p) => !deleteIds.has(p.id)),
    deletedIds: [...deleteIds],
  };
}

/** @deprecated استخدم reconcileDuplicateOnboardingPlans */
export async function reconcileDuplicateActivePlans(
  plans: OnboardingPlan[],
  companyId: string
): Promise<{ plans: OnboardingPlan[]; archivedIds: string[] }> {
  const result = await reconcileDuplicateOnboardingPlans(plans, companyId);
  return { plans: result.plans, archivedIds: result.deletedIds };
}

export function isPlanCommencementApproved(plan: OnboardingPlan): boolean {
  if (plan.status === 'completed') return true;
  return plan.commencementDetails?.isCommenced === true;
}

export function findEmployeeForPlan(
  plan: OnboardingPlan,
  employees: Array<Partial<{ id: string; civilId?: string; nameAr?: string; fullNameAr?: string }>>
) {
  return employees.find(
    (e) =>
      (plan.employeeId && e.id && plan.employeeId === e.id) ||
      (e.civilId && plan.civilId && e.civilId === plan.civilId && plan.civilId !== 'غير محدد') ||
      (e.nameAr && plan.employeeName && e.nameAr === plan.employeeName) ||
      (e.fullNameAr && plan.employeeName && e.fullNameAr === plan.employeeName)
  );
}

export function planToEmployeeDraft(
  plan: OnboardingPlan,
  companyId: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const commenced = isPlanCommencementApproved(plan);
  const sc = (plan.scannedData || {}) as Record<string, unknown>;
  const basicDefault = plan.department === 'الأطباء' ? 1200 : 700;
  const basicSalary = plan.contractDetails?.basicSalary ?? basicDefault;
  const housingAllowance = plan.contractDetails?.housingAllowance ?? 100;
  const transportAllowance = plan.contractDetails?.transportAllowance ?? 50;
  const otherAllowances = plan.contractDetails?.otherAllowances ?? 0;
  const totalSalary =
    plan.contractDetails?.totalSalary ??
    basicSalary + housingAllowance + transportAllowance + otherAllowances;

  return {
    id: overrides.id || plan.employeeId || `EMP-2026-${Date.now().toString().slice(-4)}`,
    nameAr: plan.employeeName || 'موظف جديد',
    fullNameAr: plan.employeeName || 'موظف جديد',
    fullNameEn: sc.fullNameEn || sc.fullName || '',
    nameEn: sc.fullNameEn || '',
    jobTitle: plan.jobTitle || sc.profession || 'موظف',
    dept: plan.department || 'العموم',
    department: plan.department || 'العموم',
    civilId: plan.civilId && plan.civilId !== 'غير محدد' ? plan.civilId : (sc.civilId as string) || '',
    civil_id_number: plan.civilId && plan.civilId !== 'غير محدد' ? plan.civilId : (sc.civilId as string) || '',
    email: plan.contractDetails?.workEmail || '',
    workEmail: plan.contractDetails?.workEmail || '',
    hireDate: plan.expectedStartDate || new Date().toISOString().slice(0, 10),
    joinDate: plan.expectedStartDate || new Date().toISOString().slice(0, 10),
    contractStartDate: plan.contractDetails?.startDate || plan.expectedStartDate,
    contractEndDate: plan.contractDetails?.endDate || '',
    contractType: plan.contractDetails?.contractType || 'محدد المدة (Fixed Term)',
    commencementDate: plan.commencementDetails?.actualJoiningDate || plan.expectedStartDate,
    directSupervisor: plan.commencementDetails?.directSupervisor || 'مدير القسم',
    branchLocation: plan.commencementDetails?.branchLocation || 'الفرع الرئيسي',
    isCommenced: commenced,
    companyId,
    basicSalary,
    contractSalary: basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    totalSalary,
    bankName: plan.contractDetails?.bankName || '',
    iban: plan.contractDetails?.iban || '',
    nationality: sc.nationality || 'كويتي',
    salary: totalSalary,
    carriedOverLeave2025: 0,
    carriedOverBalance: 0,
    openingBalance: 0,
    avatarColor: 'bg-purple-900',
    mohLicense: plan.mohLicense || (plan.department === 'الأطباء' ? 'MOH-DOC-TEMP' : ''),
    pifssStatus: 'subscribed',
    leaveAccrualActivated: plan.commencementDetails?.leaveAccrualActivated !== false,
    status: commenced ? 'ACTIVE' : 'ONBOARDING',
    legalChecklist: plan.legalChecklist || {
      civilIdScan: true,
      passportScan: true,
      pamWorkPermit: true,
      mohLicense: plan.department === 'الأطباء',
      medicalFitness: true,
      signedContract: true,
    },
    requiredDocuments:
      plan.requiredDocuments ||
      ['civilIdScan', 'passportScan', 'pamWorkPermit', 'signedContract', 'medicalFitness'],
    onboardingPlanId: plan.id,
    custodyItems: plan.custodyItems || [],
    documentFiles: plan.documentFiles || {},
    ...overrides,
  };
}

export function mergeEmployeeFromPlan(emp: Record<string, unknown>, plan: OnboardingPlan): Record<string, unknown> {
  const alreadyOnDuty = isEmployeeOnDuty(String(emp.status || ''));
  const commenced = isPlanCommencementApproved(plan) || alreadyOnDuty;
  return {
    ...emp,
    status: commenced ? emp.status || 'ACTIVE' : 'ONBOARDING',
    isCommenced: commenced,
    hireDate: plan.commencementDetails?.actualJoiningDate || emp.hireDate,
    civilId: plan.civilId && plan.civilId !== 'غير محدد' ? plan.civilId : emp.civilId,
    civilIdExpiry: plan.civilIdExpiry || emp.civilIdExpiry,
    passportNo: plan.passportNo || emp.passportNo,
    passportExpiry: plan.passportExpiry || emp.passportExpiry,
    mohLicense: plan.mohLicense || emp.mohLicense,
    mohLicenseExpiry: plan.mohLicenseExpiry || emp.mohLicenseExpiry,
    medicalFitnessStatus: plan.medicalFitnessStatus || emp.medicalFitnessStatus,
    medicalFitnessDate: plan.medicalFitnessDate || emp.medicalFitnessDate,
    medicalFitnessHospital: plan.medicalFitnessHospital || emp.medicalFitnessHospital,
    directSupervisor: plan.commencementDetails?.directSupervisor || emp.directSupervisor,
    branchLocation: plan.commencementDetails?.branchLocation || emp.branch || emp.branchLocation,
    email: plan.contractDetails?.workEmail || emp.email || emp.workEmail,
    workEmail: plan.contractDetails?.workEmail || emp.email || emp.workEmail,
    bankName: plan.contractDetails?.bankName || emp.bankName,
    iban: plan.contractDetails?.iban || emp.iban,
    contractType: plan.contractDetails?.contractType || emp.contractType,
    contractStartDate: plan.contractDetails?.startDate || emp.contractStartDate || emp.joinDate,
    contractEndDate: plan.contractDetails?.endDate || emp.contractEndDate,
    basicSalary: plan.contractDetails?.basicSalary || emp.basicSalary,
    housingAllowance: plan.contractDetails?.housingAllowance || emp.housingAllowance,
    transportAllowance: plan.contractDetails?.transportAllowance || emp.transportAllowance,
    otherAllowances: plan.contractDetails?.otherAllowances || emp.otherAllowances,
    totalSalary: plan.contractDetails?.totalSalary || emp.totalSalary,
    leaveAccrualActivated: plan.commencementDetails?.leaveAccrualActivated !== false,
    onboardingPlanId: plan.id,
    legalChecklist: plan.legalChecklist || emp.legalChecklist,
    requiredDocuments: plan.requiredDocuments || emp.requiredDocuments,
    custodyItems: plan.custodyItems || emp.custodyItems || [],
    documentFiles: {
      ...((emp.documentFiles as Record<string, unknown>) || {}),
      ...(plan.documentFiles || {}),
    },
  };
}

export async function persistOnboardingPlan(plan: OnboardingPlan, companyId: string): Promise<void> {
  const normalized = normalizeOnboardingPlanFromFirestore(plan, companyId);
  await setDoc(
    doc(db, 'onboarding_plans', normalized.id),
    cleanFirestoreData({
      ...normalized,
      companyId,
      status: normalizeOnboardingPlanStatus(normalized.status),
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

export type LaunchOnboardingResult =
  | { kind: 'created'; bundle: EmployeeOnboardingBundle; plan: OnboardingPlan }
  | { kind: 'updated'; employee: Record<string, unknown>; plan: OnboardingPlan };

export async function launchOnboardingFromPlan(params: {
  companyId: string;
  plan: OnboardingPlan;
  existingEmployees: Array<Record<string, unknown>>;
  existingPlans?: OnboardingPlan[];
  nextEmployeeId?: string;
}): Promise<LaunchOnboardingResult> {
  const { companyId, plan, existingEmployees, existingPlans = [] } = params;
  const existing = findEmployeeForPlan(plan, existingEmployees as any);
  const planBase = existingPlans.length
    ? coalesceOnboardingPlanLaunch(plan, existingPlans, companyId)
    : normalizeOnboardingPlanFromFirestore({ ...plan, status: plan.status || 'active' }, companyId);

  if (!existing) {
    const nextId =
      params.nextEmployeeId ||
      `EMP-2026-${String(existingEmployees.length + 1).padStart(3, '0')}`;
    const seed = planToEmployeeDraft(planBase, companyId, { id: nextId });
    const bundle = await createEmployeeOnboardingBundle({
      companyId,
      employee: seed,
      existingEmployees,
    });
    const linkedPlan: OnboardingPlan = {
      ...planBase,
      employeeId: String(bundle.employee.id),
    };
    await persistOnboardingPlan(linkedPlan, companyId);
    return { kind: 'created', bundle, plan: linkedPlan };
  }

  const updated = mergeEmployeeFromPlan(existing as Record<string, unknown>, planBase);
  await TenantDatabaseService.saveEmployee(updated as any, companyId);
  const linkedPlan: OnboardingPlan = {
    ...planBase,
    employeeId: String(updated.id),
  };
  await persistOnboardingPlan(linkedPlan, companyId);
  return { kind: 'updated', employee: updated, plan: linkedPlan };
}

export function employeeHasOnboardingContract(
  employeeId: string,
  companyId: string,
  contracts: Array<{ id?: string; employeeId?: string }>
): boolean {
  const contractId = `contract-${companyId}-${employeeId}`;
  return contracts.some(
    (c) => c.id === contractId || String(c.employeeId || '') === String(employeeId)
  );
}

/** مزامنة خطة → ملف الموظف دون إعادة إنشاء الحزمة إذا العقد موجود (يمنع التكرار). */
export async function syncPlanToEmployeeRecord(params: {
  companyId: string;
  plan: OnboardingPlan;
  existingEmployees: Array<Record<string, unknown>>;
  existingContracts?: Array<{ id?: string; employeeId?: string }>;
}): Promise<void> {
  const { companyId, plan, existingEmployees, existingContracts = [] } = params;
  let match = findEmployeeForPlan(plan, existingEmployees as any);
  if (!match) {
    const remote = await TenantDatabaseService.getEmployeesByTenant(companyId);
    match = findEmployeeForPlan(plan, remote as any);
  }

  if (!match) return;

  const updated = mergeEmployeeFromPlan(match as Record<string, unknown>, plan);
  await TenantDatabaseService.saveEmployee(updated as any, companyId);

  const employeeId = String(updated.id);
  if (!employeeHasOnboardingContract(employeeId, companyId, existingContracts)) {
    try {
      await createEmployeeOnboardingBundle({
        companyId,
        employee: updated,
        existingEmployees: existingEmployees.filter((e) => String(e.id) !== employeeId),
      });
    } catch (err) {
      console.warn('[onboardingService] bundle ensure skipped:', err);
    }
  }
}

export function buildActiveOnboardingDirectoryKeys(
  plans: OnboardingPlan[],
  companyId: string
): {
  employeeIds: Set<string>;
  civilIds: Set<string>;
  planIds: Set<string>;
} {
  const employeeIds = new Set<string>();
  const civilIds = new Set<string>();
  const planIds = new Set<string>();

  for (const plan of plans) {
    if (plan.companyId && plan.companyId !== companyId) continue;
    if (!isOnboardingPlanInProgress(plan)) continue;
    if (isPlanCommencementApproved(plan)) continue;
    planIds.add(plan.id);
    if (plan.employeeId) employeeIds.add(String(plan.employeeId));
    if (plan.civilId && plan.civilId !== 'غير محدد') civilIds.add(String(plan.civilId));
  }

  return { employeeIds, civilIds, planIds };
}

export function employeeHasActiveOnboardingPlan(
  emp: Record<string, unknown>,
  keys: ReturnType<typeof buildActiveOnboardingDirectoryKeys>
): boolean {
  const id = String(emp.id || '');
  const civil = String(emp.civilId || emp.civil_id_number || '');
  const planId = String(emp.onboardingPlanId || '');
  return (
    (id && keys.employeeIds.has(id)) ||
    (civil && keys.civilIds.has(civil)) ||
    (planId && keys.planIds.has(planId))
  );
}

export function shouldDisplayEmployeeAsOnboarding(
  emp: Record<string, unknown>,
  keys: ReturnType<typeof buildActiveOnboardingDirectoryKeys>
): boolean {
  return isEmployeeOnboarding(String(emp.status || '')) || employeeHasActiveOnboardingPlan(emp, keys);
}

export function employeeMatchesActiveOnboarding(
  emp: Record<string, unknown>,
  keys: ReturnType<typeof buildActiveOnboardingDirectoryKeys>
): boolean {
  return shouldDisplayEmployeeAsOnboarding(emp, keys);
}

/** مزامنة حالة الموظف في Firestore مع خطط التهيئة الجارية. */
export async function syncDirectoryEmployeeStatusesFromPlans(params: {
  companyId: string;
  plans: OnboardingPlan[];
  employees: Array<Record<string, unknown>>;
}): Promise<void> {
  const { companyId, plans, employees } = params;
  const keys = buildActiveOnboardingDirectoryKeys(plans, companyId);

  for (const emp of employees) {
    if (emp.isDeleted) continue;
    const empId = String(emp.id || '');
    if (!empId) continue;

    const linkedToActivePlan = employeeHasActiveOnboardingPlan(emp, keys);
    const currentlyOnboarding = isEmployeeOnboarding(String(emp.status || ''));
    const onDuty = isEmployeeOnDuty(String(emp.status || ''));

    if (linkedToActivePlan && !currentlyOnboarding) {
      await TenantDatabaseService.saveEmployee(
        {
          ...emp,
          status: 'ONBOARDING',
          isCommenced: false,
        } as any,
        companyId
      );
      continue;
    }

    if (currentlyOnboarding && !linkedToActivePlan && onDuty) {
      continue;
    }

    if (currentlyOnboarding && !linkedToActivePlan && !onDuty) {
      const linkedCompleted = plans.some(
        (p) =>
          isOnboardingPlanCompleted(p) &&
          (p.employeeId === empId ||
            (p.civilId &&
              p.civilId !== 'غير محدد' &&
              String(emp.civilId || emp.civil_id_number) === p.civilId))
      );
      if (linkedCompleted) {
        await TenantDatabaseService.saveEmployee(
          {
            ...emp,
            status: 'ACTIVE',
            isCommenced: true,
          } as any,
          companyId
        );
      }
    }
  }
}

export { createEmployeeOnboardingBundle } from './employeeOnboardingService';
