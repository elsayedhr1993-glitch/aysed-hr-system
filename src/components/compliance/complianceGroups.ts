import type { DepartmentConfig, LicenseDocument } from '../types/governmentLicense';
import { getLicenseDaysRemaining } from '../../utils/governmentLicenseExpiry';

export type ComplianceGroupRow = {
  id: string;
  entity: string;
  count: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  nearestExpiry: string;
};

function expiryTime(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/** Groups active licenses. Folder counts and the document archive stay separate sources. */
export function complianceGroupRows(
  departments: readonly DepartmentConfig[],
  documents: readonly LicenseDocument[]
): ComplianceGroupRow[] {
  const active = documents.filter((document) => !document.archived);
  return departments.map((department) => {
    const rows = active.filter((document) => document.departmentId === department.id);
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    for (const row of rows) {
      const status = getLicenseDaysRemaining(row.expiryDate).status;
      if (status === 'expired') expired += 1;
      else if (status === 'warning') expiringSoon += 1;
      else valid += 1;
    }
    const nearest = [...rows].sort((a, b) => expiryTime(a.expiryDate) - expiryTime(b.expiryDate))[0];
    return {
      id: department.id,
      entity: department.name,
      count: rows.length,
      valid,
      expiringSoon,
      expired,
      nearestExpiry: nearest?.expiryDate || '—',
    };
  });
}
