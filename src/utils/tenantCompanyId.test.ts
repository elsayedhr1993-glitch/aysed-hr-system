import test from 'node:test';
import assert from 'node:assert/strict';
import { companyPickerHintFromQuery, resolveTenantCompanyId } from './tenantCompanyId.ts';

test('resolveTenantCompanyId prefers CompanyContext id over fallback', () => {
  assert.equal(
    resolveTenantCompanyId('comp-1788442584841', 'comp-other'),
    'comp-1788442584841'
  );
});

test('resolveTenantCompanyId ignores SAAS_PLATFORM and uses fallback', () => {
  assert.equal(resolveTenantCompanyId('SAAS_PLATFORM', 'tenant_1788413304890'), 'tenant_1788413304890');
});

test('resolveTenantCompanyId returns undefined when empty', () => {
  assert.equal(resolveTenantCompanyId('', ''), undefined);
});

test('query company id does not select the tenant and is only a verified admin hint', () => {
  assert.equal(resolveTenantCompanyId('comp-a', 'comp-b', 'comp-from-url'), 'comp-a');
  assert.equal(resolveTenantCompanyId('', '', 'comp-from-url'), undefined);
  assert.equal(companyPickerHintFromQuery(false, true, 'comp-from-url'), '');
  assert.equal(companyPickerHintFromQuery(true, false, 'comp-from-url'), '');
  assert.equal(companyPickerHintFromQuery(true, true, 'comp-from-url'), 'comp-from-url');
});
