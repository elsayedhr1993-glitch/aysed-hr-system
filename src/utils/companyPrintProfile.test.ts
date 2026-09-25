import test from 'node:test';
import assert from 'node:assert/strict';
import { getCompanyPrintProfile, mergeCompanyFromFirestore } from './companyPrintProfile.ts';
import type { Company } from '../types.ts';

test('getCompanyPrintProfile prefers nameAr and registry fields', () => {
  const profile = getCompanyPrintProfile({
    id: 'comp-1788442584841',
    nameAr: 'مستوصف المنار الطبي',
    nameEn: 'Almanar Clinic',
    civilIdCompany: '203344',
    commercialRegNo: '301122',
    wsiCode: 'WSI-ALMANAR',
  } as Company);
  assert.equal(profile.displayNameAr, 'مستوصف المنار الطبي');
  assert.equal(profile.civilIdCompany, '203344');
  assert.equal(profile.commercialReg, '301122');
});

test('mergeCompanyFromFirestore maps Firestore company doc', () => {
  const base = { id: 'x', nameAr: '', nameEn: '' } as Company;
  const merged = mergeCompanyFromFirestore(
    base,
    {
      nameAr: 'إيليت كلينك',
      commercialReg: '999888',
      civilIdCompany: '111222333444',
      logoUrl: 'https://example.com/logo.png',
    },
    'comp-1788435917695'
  );
  assert.equal(merged.nameAr, 'إيليت كلينك');
  assert.equal(merged.commercialRegNo, '999888');
  assert.equal(merged.logoUrl, 'https://example.com/logo.png');
});
