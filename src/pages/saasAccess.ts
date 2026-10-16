import { normalizeHrRole } from '../security/accessRoles';

export function platformOwnerFromRole(role: string | null | undefined): boolean {
  return normalizeHrRole(role) === 'SUPER_ADMIN';
}

export function manarClinicRows(rows: readonly { id: string; name: string }[]): {
  exactCount: number;
  relatedCount: number;
  duplicateExact: boolean;
} {
  const exact = rows.filter((row) => row.name.trim() === 'المنار كلينك');
  const related = rows.filter((row) => row.name.includes('المنار'));
  return {
    exactCount: exact.length,
    relatedCount: related.length,
    duplicateExact: exact.length > 1,
  };
}

export function archiveConfirmReady(typed: string, facilityName: string): boolean {
  return typed.trim() === facilityName.trim() && facilityName.trim().length > 0;
}
