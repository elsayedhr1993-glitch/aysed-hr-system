import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompanyDocumentsFromFacility,
  deriveCompanyProfilePatchFromLicenses,
} from './companyLicenseSync.ts';
import type { FacilityLicenseData } from '../components/facility/FacilityLicensingWizardModal.tsx';

test('deriveCompanyProfilePatchFromLicenses merges facility and custom document rows', () => {
  const facility: FacilityLicenseData = {
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

  const patch = deriveCompanyProfilePatchFromLicenses(docs, facility);
  assert.equal(patch.nameAr, 'الفنار كلينك');
  assert.equal(patch.commercialRegNo, 'CR-1000');
  assert.equal(patch.mohLicense, 'MOH-1');
  assert.equal(patch.wsiCode, 'PAM-9');

  const built = buildCompanyDocumentsFromFacility('tenant_1', facility);
  assert.ok(built.some((d) => d.documentType.includes('تجاري')));
});
