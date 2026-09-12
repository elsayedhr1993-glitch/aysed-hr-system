import test from 'node:test';
import assert from 'node:assert/strict';

import { getDeterministicCompanyId } from './CompanyContext.tsx';

test('getDeterministicCompanyId resolves the same id for the same company name regardless of hostname', () => {
  assert.equal(getDeterministicCompanyId('مستوصف المنار الطبي'), 'comp-1788442584841');
  assert.equal(getDeterministicCompanyId({ nameAr: 'مستوصف المنار الطبي' }), 'comp-1788442584841');
  assert.equal(getDeterministicCompanyId({ name: 'شركة الفنار' }), 'comp-alfanar');
  assert.equal(getDeterministicCompanyId({ nameAr: 'إيليت للخدمات' }), 'comp-elite');
});

test('getDeterministicCompanyId resolves the Super Admin id for the central management name', () => {
  assert.equal(getDeterministicCompanyId('comp-super-admin'), 'comp-super-admin');
  assert.equal(getDeterministicCompanyId({ nameAr: 'إدارة النظام المركزية (Super Admin)' }), 'comp-super-admin');
});
