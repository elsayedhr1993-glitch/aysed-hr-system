import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contractQueryCompanyIds,
  employeeBelongsToTenant,
  employeeVisibleInDirectory,
  normalizeTenantCompanyId,
} from './contractTenantRules.ts';

const MANAR = 'comp-1788442584841';
const MANAR_TYPO = 'comp-1788142584811';

test('contractQueryCompanyIds includes المنار id variants', () => {
  const ids = contractQueryCompanyIds(MANAR);
  assert.ok(ids.includes(MANAR));
  assert.ok(ids.includes('1788442584841'));
  assert.ok(contractQueryCompanyIds(MANAR_TYPO).includes(MANAR));
});

test('normalizeTenantCompanyId maps common المنار URL typo to canonical id', () => {
  assert.equal(normalizeTenantCompanyId(MANAR_TYPO), MANAR);
});

test('employeeBelongsToTenant matches raw legacy company id variant', () => {
  assert.equal(
    employeeBelongsToTenant({ companyId: '1788442584841', fullNameAr: 'test' }, MANAR),
    true
  );
});

test('employeeVisibleInDirectory keeps Firestore-merged rows regardless of status', () => {
  assert.equal(
    employeeVisibleInDirectory(
      { _tenantFirestoreMatch: true, status: 'TERMINATED', companyId: MANAR },
      MANAR
    ),
    true
  );
});
