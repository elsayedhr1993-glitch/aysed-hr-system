import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contractQueryCompanyIds,
  employeeBelongsToTenant,
  employeeVisibleInDirectory,
} from './contractTenantRules.ts';

const MANAR = 'comp-1788442584841';

test('contractQueryCompanyIds includes المنار id variants', () => {
  const ids = contractQueryCompanyIds(MANAR);
  assert.ok(ids.includes(MANAR));
  assert.ok(ids.includes('1788442584841'));
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
