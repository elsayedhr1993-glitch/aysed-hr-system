import { checkDocumentExpiry } from './dateUtils';

/** Document slot keys aligned with EmployeeDocumentsTab / onboarding checklist. */
export const CORE_MANDATORY_DOCUMENT_KEYS = [
  'civilIdScan',
  'passportScan',
  'pamWorkPermit',
  'mohLicense',
  'medicalFitness',
  'signedContract',
] as const;

export type MandatoryDocumentKey = (typeof CORE_MANDATORY_DOCUMENT_KEYS)[number] | string;

const DOC_EXPIRY_FIELD_CANDIDATES: Record<string, string[]> = {
  civilIdScan: ['civilIdExpiry', 'civilIdExpiryDate', 'civil_id_expiry'],
  passportScan: ['passportExpiry', 'passportExpiryDate'],
  pamWorkPermit: ['pamWorkPermitExpiryDate', 'workPermitExpiry', 'residencyExpiry'],
  mohLicense: ['mohLicenseExpiry'],
  medicalFitness: ['medicalFitnessExpiry'],
  signedContract: ['contractEndDate'],
};

function isMedicalStaff(employee: Record<string, unknown>): boolean {
  const dept = String(employee.dept || employee.department || '');
  const job = String(employee.jobTitle || '');
  return ['الأطباء', 'التمريض'].includes(dept) || job.includes('طبيب') || job.includes('ممرض');
}

/** Same rules as EmployeeDocumentsTab `requiredChecklist`. */
export function buildEmployeeRequiredDocumentChecklist(
  employee: Record<string, unknown>
): Record<string, boolean> {
  const checklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: isMedicalStaff(employee) || String(employee.dept || employee.department || '') === 'الأطباء',
    medicalFitness: true,
    signedContract: true,
    ...((employee.legalChecklist as Record<string, boolean>) || {}),
  };

  const requiredDocuments = employee.requiredDocuments as string[] | undefined;
  if (Array.isArray(requiredDocuments)) {
    for (const key of requiredDocuments) {
      checklist[key] = true;
    }
  }

  const customDocuments = employee.customDocuments as Array<{ id: string; required?: boolean }> | undefined;
  if (Array.isArray(customDocuments)) {
    for (const doc of customDocuments) {
      if (doc?.id && doc.required) {
        checklist[doc.id] = true;
      }
    }
  }

  return checklist;
}

function hasUploadedDocumentFile(employee: Record<string, unknown>, docKey: string): boolean {
  const files = employee.documentFiles as Record<string, { url?: string; name?: string }> | undefined;
  const file = files?.[docKey];
  if (!file) return false;
  return Boolean(file.url || file.name);
}

function resolveExpiryRaw(employee: Record<string, unknown>, docKey: string): string | null {
  const fields = DOC_EXPIRY_FIELD_CANDIDATES[docKey];
  if (!fields) return null;
  for (const field of fields) {
    const value = employee[field];
    if (value != null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return null;
}

/**
 * Mandatory slot is compliant only when the file is uploaded and any known expiry date is not past.
 */
export function isMandatoryDocumentSlotCompliant(
  employee: Record<string, unknown>,
  docKey: string
): boolean {
  if (!hasUploadedDocumentFile(employee, docKey)) {
    return false;
  }

  const expiryRaw = resolveExpiryRaw(employee, docKey);
  if (!expiryRaw) {
    return true;
  }

  const expiryStatus = checkDocumentExpiry(expiryRaw);
  return !expiryStatus.isExpired;
}

export interface EmployeeDocumentComplianceBreakdown {
  fulfilled: number;
  total: number;
  percentage: number;
  missingKeys: string[];
}

export function computeEmployeeDocumentCompliance(
  employee: Record<string, unknown>
): EmployeeDocumentComplianceBreakdown {
  const checklist = buildEmployeeRequiredDocumentChecklist(employee);
  const requiredKeys = Object.entries(checklist)
    .filter(([, required]) => required)
    .map(([key]) => key);

  const missingKeys: string[] = [];
  let fulfilled = 0;

  for (const key of requiredKeys) {
    if (isMandatoryDocumentSlotCompliant(employee, key)) {
      fulfilled += 1;
    } else {
      missingKeys.push(key);
    }
  }

  const total = requiredKeys.length;
  const percentage = total === 0 ? 100 : Math.round((fulfilled / total) * 100);

  return { fulfilled, total, percentage, missingKeys };
}

export interface CompanyDocumentComplianceStats {
  fulfilled: number;
  total: number;
  percentage: number;
  employeeCount: number;
}

/** Company-wide KPI: fulfilled mandatory slots / all mandatory slots across employees. */
export function computeCompanyDocumentComplianceStats(
  employees: Record<string, unknown>[]
): CompanyDocumentComplianceStats {
  if (!employees.length) {
    return { fulfilled: 0, total: 0, percentage: 0, employeeCount: 0 };
  }

  let fulfilled = 0;
  let total = 0;

  for (const emp of employees) {
    const breakdown = computeEmployeeDocumentCompliance(emp);
    fulfilled += breakdown.fulfilled;
    total += breakdown.total;
  }

  const percentage = total === 0 ? 0 : Math.round((fulfilled / total) * 100);

  return {
    fulfilled,
    total,
    percentage,
    employeeCount: employees.length,
  };
}
