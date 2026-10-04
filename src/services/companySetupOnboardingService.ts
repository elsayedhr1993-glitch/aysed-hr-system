import type { Company, CompanyComplianceDoc } from '../types';
import type { LeavePolicyData } from '../components/leaves/LeavePolicyWizardModal';

export type CompanySetupStepId =
  | 'company_profile'
  | 'gov_compliance'
  | 'org_structure'
  | 'work_policies';

export interface CompanySetupStepDef {
  id: CompanySetupStepId;
  titleAr: string;
  titleEn: string;
  hintAr: string;
}

export const COMPANY_SETUP_STEPS: CompanySetupStepDef[] = [
  {
    id: 'company_profile',
    titleAr: 'بيانات المنشأة',
    titleEn: 'Company profile',
    hintAr: 'الاسم، الشعار، السجل، واتصال المنشأة',
  },
  {
    id: 'gov_compliance',
    titleAr: 'الامتثال والتراخيص',
    titleEn: 'Compliance & licences',
    hintAr: 'MOH، PAM، KFF والتراخيص الحكومية',
  },
  {
    id: 'org_structure',
    titleAr: 'الهيكل والأقسام',
    titleEn: 'Departments & jobs',
    hintAr: 'الأقسام الطبية والإدارية والوظائف',
  },
  {
    id: 'work_policies',
    titleAr: 'سياسات العمل',
    titleEn: 'Work policies',
    hintAr: 'العطلات، الإجازات، ومسير WPS',
  },
];

export interface CompanySetupStepState extends CompanySetupStepDef {
  done: boolean;
  progress: number;
}

export interface CompanySetupOnboardingState {
  steps: CompanySetupStepState[];
  overallPercent: number;
  complete: boolean;
}

function scoreProfile(company: Company | null | undefined): number {
  if (!company) return 0;
  let pts = 0;
  const checks = [
    Boolean(company.nameAr || company.name),
    Boolean(company.commercialRegNo || company.crNumber || (company as { commercialReg?: string }).commercialReg),
    Boolean(company.pamFileNumber && company.pamFileNumber !== '---'),
    Boolean(company.phone || company.ownerPhone || company.email),
    Boolean(company.logoUrl),
  ];
  pts = checks.filter(Boolean).length;
  return Math.round((pts / checks.length) * 100);
}

function scoreCompliance(company: Company | null | undefined, compliance: CompanyComplianceDoc | null): number {
  let pts = 0;
  if (company?.pamFileNumber && company.pamFileNumber.length >= 4) pts += 35;
  if (compliance) {
    pts += Math.round((compliance.overallPercent || 0) * 0.45);
    const pamTrack = compliance.tracks?.find((t) => /pam|شؤون/i.test(t.label));
    if (pamTrack && pamTrack.status !== 'missing') pts += 10;
  }
  return Math.min(100, pts);
}

function scoreOrg(departmentCount: number, employeesCount: number, jobTitlesCount: number): number {
  if (departmentCount >= 2 && employeesCount >= 2) return 100;
  if (departmentCount >= 1 && employeesCount >= 1) return 75;
  if (departmentCount >= 1 || jobTitlesCount >= 2) return 50;
  return departmentCount > 0 ? 40 : 0;
}

function scorePolicies(
  company: Company | null | undefined,
  leavePolicy: LeavePolicyData | null | undefined,
  attendanceConfigured: boolean
): number {
  let pts = 0;
  if (leavePolicy && (leavePolicy.isActivated || leavePolicy.annualDays > 0)) pts += 40;
  if (company?.iban || company?.wsiCode) pts += 35;
  if (attendanceConfigured) pts += 25;
  return Math.min(100, pts);
}

export function buildCompanySetupOnboardingState(input: {
  company: Company | null | undefined;
  compliance: CompanyComplianceDoc | null;
  departmentCount: number;
  employeesCount: number;
  distinctJobTitles: number;
  leavePolicy?: LeavePolicyData | null;
  attendancePolicyConfigured?: boolean;
}): CompanySetupOnboardingState {
  const profile = scoreProfile(input.company);
  const gov = scoreCompliance(input.company, input.compliance);
  const org = scoreOrg(input.departmentCount, input.employeesCount, input.distinctJobTitles);
  const policies = scorePolicies(
    input.company,
    input.leavePolicy,
    Boolean(input.attendancePolicyConfigured)
  );

  const progressById: Record<CompanySetupStepId, number> = {
    company_profile: profile,
    gov_compliance: gov,
    org_structure: org,
    work_policies: policies,
  };

  const steps: CompanySetupStepState[] = COMPANY_SETUP_STEPS.map((def) => ({
    ...def,
    progress: progressById[def.id],
    done: progressById[def.id] >= 100,
  }));

  const overallPercent = Math.round(
    steps.reduce((sum, s) => sum + s.progress, 0) / Math.max(steps.length, 1)
  );

  return {
    steps,
    overallPercent,
    complete: steps.every((s) => s.done),
  };
}

export function companySetupBannerDismissKey(companyId: string): string {
  return `aysed_company_setup_banner_dismissed_${companyId}`;
}

export function isCompanySetupBannerDismissed(companyId: string): boolean {
  try {
    return localStorage.getItem(companySetupBannerDismissKey(companyId)) === '1';
  } catch {
    return false;
  }
}

export function dismissCompanySetupBanner(companyId: string): void {
  try {
    localStorage.setItem(companySetupBannerDismissKey(companyId), '1');
  } catch {
    /* ignore */
  }
}
