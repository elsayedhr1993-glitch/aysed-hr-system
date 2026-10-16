import { describe, expect, it } from 'vitest';
import { GOVERNMENT_COMPLIANCE_DEPARTMENTS } from '../../config/governmentComplianceDepartments';
import type { LicenseDocument } from '../../types/governmentLicense';
import { complianceGroupRows } from './complianceGroups';

function license(partial: Partial<LicenseDocument>): LicenseDocument {
  return {
    id: 'lic',
    companyId: 'c',
    departmentId: 'MOH',
    folderId: 'moh_facility',
    title: 'ترخيص',
    documentNumber: '1',
    expiryDate: '2099-01-01',
    ...partial,
  };
}

describe('compliance groups', () => {
  it('rolls licenses up without merging folder counts or the archive', () => {
    const today = new Date();
    const soon = new Date(today);
    soon.setDate(today.getDate() + 10);
    const past = new Date(today);
    past.setDate(today.getDate() - 3);
    const iso = (date: Date) => date.toISOString().slice(0, 10);
    const rows = complianceGroupRows(GOVERNMENT_COMPLIANCE_DEPARTMENTS, [
      license({ id: 'a', expiryDate: '2099-04-01' }),
      license({ id: 'b', expiryDate: iso(soon) }),
      license({ id: 'c', expiryDate: iso(past) }),
      license({ id: 'd', archived: true, expiryDate: '2099-01-01' }),
      license({ id: 'e', departmentId: 'PAM', expiryDate: '2028-02-02' }),
    ]);
    const moh = rows.find((row) => row.id === 'MOH');
    expect(moh).toMatchObject({
      entity: 'وزارة الصحة',
      count: 3,
      valid: 1,
      expiringSoon: 1,
      expired: 1,
      nearestExpiry: iso(past),
    });
    expect(rows.find((row) => row.id === 'PAM')?.count).toBe(1);
    expect(moh).not.toHaveProperty('folders');
    expect(GOVERNMENT_COMPLIANCE_DEPARTMENTS[0].folders.length).toBeGreaterThan(0);
  });
});
