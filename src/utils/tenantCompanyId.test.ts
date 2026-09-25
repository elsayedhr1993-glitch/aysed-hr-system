import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTenantCompanyId } from './tenantCompanyId.ts';

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
