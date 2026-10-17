import test from 'node:test';
import assert from 'node:assert/strict';

import {
  planCompanyIdFieldUpdates,
  planLegacyDocumentId,
} from './companyIdAliases.ts';

test('planCompanyIdFieldUpdates rewrites legacy company fields and leaves canonical values', () => {
  const hits = planCompanyIdFieldUpdates('employees/e1', {
    companyId: 'comp-alfanar',
    company_id: 'comp-elite',
    activeCompanyId: 'comp-1788442584841',
    name: 'ignored',
  });
  assert.deepEqual(hits, [
    { path: 'employees/e1', field: 'companyId', from: 'comp-alfanar', to: 'tenant_1788413304890' },
    { path: 'employees/e1', field: 'company_id', from: 'comp-elite', to: 'comp-1788435917695' },
  ]);
});

test('planLegacyDocumentId reports an alias document id without treating it as a field write', () => {
  assert.deepEqual(planLegacyDocumentId('companies/comp-manar', 'comp-manar'), {
    path: 'companies/comp-manar',
    from: 'comp-manar',
    to: 'comp-1788442584841',
  });
  assert.equal(planLegacyDocumentId('system_config/leave_policy_comp-alfanar', 'leave_policy_comp-alfanar')?.to, 'leave_policy_tenant_1788413304890');
  assert.equal(planLegacyDocumentId('companies/comp-1788442584841', 'comp-1788442584841'), null);
});
