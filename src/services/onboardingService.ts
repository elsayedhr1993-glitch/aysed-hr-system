import { doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { OnboardingPlan } from '../types';
import {
  createEmployeeOnboardingBundle,
  EmployeeOnboardingBundle,
} from './employeeOnboardingService';
import { TenantDatabaseService } from './tenantDataService';

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
  const commenced = isPlanCommencementApproved(plan);
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
  await setDoc(
    doc(db, 'onboarding_plans', plan.id),
    cleanFirestoreData({
      ...plan,
      companyId,
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
  nextEmployeeId?: string;
}): Promise<LaunchOnboardingResult> {
  const { companyId, plan, existingEmployees } = params;
  const existing = findEmployeeForPlan(plan, existingEmployees as any);
  const planBase: OnboardingPlan = {
    ...plan,
    companyId,
    status: plan.status || 'active',
  };

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
    if (plan.status !== 'active') continue;
    planIds.add(plan.id);
    if (plan.employeeId) employeeIds.add(String(plan.employeeId));
    if (plan.civilId && plan.civilId !== 'غير محدد') civilIds.add(String(plan.civilId));
  }

  return { employeeIds, civilIds, planIds };
}

export function employeeMatchesActiveOnboarding(
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

export { createEmployeeOnboardingBundle } from './employeeOnboardingService';
