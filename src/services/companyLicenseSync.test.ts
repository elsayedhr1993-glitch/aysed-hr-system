import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompanyDocumentsFromFacility,
  deriveCompanyProfilePatchFromLicenses,
  deriveFacilityPatchFromLicenses,
} from './companyLicenseSync.ts';
import type { FacilityLicenseData } from '../types/facilityLicense.ts';

const mohFacility: FacilityLicenseData = {
  nameAr: 'الفنار كلينك',
  nameEn: 'Fanar Clinic',
  commercialRegNo: 'CR-1000',
  paciCivilId: '123456789012',
  logoUrl: '',
  mainBranchName: '',
  branchesList: [],
  mohLicenseNo: 'MOH-1',
  mohStartDate: '2024-01-01',
  mohExpiryDate: '2027-01-01',
  mohApprovedDepts: [],
  mohSpecialDevices: [],
  pamFileCode: 'PAM-9',
  authorizedSignatoryName: 'المدير',
  authorizedSignatoryCivilId: '',
  wpsBankCode: '',
  wpsEmployerId: '',
  kffLicenseNo: '',
  kffExpiryDate: '',
  baladiyaLicenseNo: '',
  baladiyaExpiryDate: '',
};

test('deriveCompanyProfilePatchFromLicenses merges facility and custom document rows (MOH default — no CR)', () => {
  const docs = [
    {
      id: 'x1',
      companyId: 'tenant_1',
      name: 'ترخيص مخصص',
      documentType: 'ترخيص صيدلية خاص',
      documentNumber: 'PH-2026',
      issuingAuthority: 'وزارة الصحة',
      issueDate: '2025-01-01',
      expiryDate: '2026-01-01',
    },
  ];

  const patch = deriveCompanyProfilePatchFromLicenses(docs, mohFacility);
  assert.equal(patch.nameAr, 'الفنار كلينك');
  assert.equal(patch.commercialRegNo, undefined);
  assert.equal(patch.mohLicense, 'MOH-1');
  assert.equal(patch.wsiCode, 'PAM-9');
  assert.equal(patch.civilIdCompany, '123456789012');

  const built = buildCompanyDocumentsFromFacility('tenant_1', mohFacility);
  assert.ok(!built.some((d) => d.documentType.includes('تجاري')));
  assert.ok(built.some((d) => d.documentType.includes('صحي')));
});

test('deriveFacilityPatchFromLicenses maps archive rows back to wizard fields (ignores commercial for MOH)', () => {
  const docs = [
    {
      id: 'lic-tenant_1-moh',
      companyId: 'tenant_1',
      name: 'ترخيص وزارة الصحة',
      documentType: 'ترخيص صحي/طبي',
      documentNumber: 'MOH-UPDATED',
      issuingAuthority: 'وزارة الصحة',
      issueDate: '2025-06-01',
      expiryDate: '2028-06-01',
      notes: 'أقسام: طب عام، أسنان',
    },
    {
      id: 'lic-tenant_1-commercial',
      companyId: 'tenant_1',
      name: 'سجل',
      documentType: 'رخصة تجارية',
      documentNumber: 'CR-55',
      issuingAuthority: 'وزارة التجارة',
      issueDate: '2025-01-01',
      expiryDate: '2099-12-31',
      notes: 'الفرع: حولي',
    },
  ];
  const patch = deriveFacilityPatchFromLicenses('tenant_1', docs);
  assert.equal(patch.mohLicenseNo, 'MOH-UPDATED');
  assert.equal(patch.mohStartDate, '2025-06-01');
  assert.equal(patch.commercialRegNo, undefined);
  assert.equal(patch.mainBranchName, undefined);
  assert.deepEqual(patch.mohApprovedDepts, ['طب عام', 'أسنان']);
});
