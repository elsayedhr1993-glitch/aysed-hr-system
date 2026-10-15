import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { decideTenantAccess } from '../../src/security/accessRoles';
import { maskIdentity } from '../../src/security/identityMask';
import {
  GENERIC_LOGIN_ERROR,
  __resetAuthSecurityForTests,
  attemptKey,
  consumePasswordResetToken,
  inspectLoginAttempt,
  issuePasswordResetToken,
  recordLoginFailure,
} from '../authSecurity';
import { applySessionCompanyOnBody, stripClientCompanyHints } from '../tenantScope';
import { verifyTotp, generateTotpSecret, totpCode } from '../totp';
import { companyForDevice } from '../deviceTenantMap';

test('client company id is removed and a mismatch is rejected', () => {
  const req = {
    query: { companyId: 'other', cid: 'other', keep: '1' },
    headers: { 'x-company-id': 'other' },
    body: { companyId: 'other', name: 'n' },
  } as any;
  stripClientCompanyHints(req);
  assert.equal(req.query.companyId, undefined);
  assert.equal(req.query.cid, undefined);
  assert.equal(req.query.keep, '1');
  assert.equal(req.headers['x-company-id'], undefined);
  const denied = applySessionCompanyOnBody(req.body, 'comp-session');
  assert.equal(denied.ok, false);
  const allowed = applySessionCompanyOnBody({ companyId: 'comp-session', name: 'n' }, 'comp-session');
  assert.equal(allowed.ok, true);
});

test('civil id and passport stay partially hidden', () => {
  assert.equal(maskIdentity('293080106877', 'civil').endsWith('877'), true);
  assert.equal(maskIdentity('293080106877', 'civil').includes('293080106'), false);
  assert.equal(maskIdentity('K009123', 'passport').endsWith('23'), true);
  assert.equal(maskIdentity('', 'civil'), '');
});

test('login lock uses one generic error and a reset token works once', () => {
  __resetAuthSecurityForTests();
  const key = attemptKey('127.0.0.1', 'person@example.com');
  for (let i = 0; i < 5; i += 1) recordLoginFailure(key, 1_000);
  assert.equal(inspectLoginAttempt(key, 1_000).allowed, false);
  assert.equal(GENERIC_LOGIN_ERROR.includes('موجود'), false);
  const token = issuePasswordResetToken('person@example.com', 1_000);
  assert.equal(consumePasswordResetToken(token, 1_000), 'person@example.com');
  assert.equal(consumePasswordResetToken(token, 1_000), null);
});

test('totp accepts the current step only', () => {
  const secret = generateTotpSecret();
  const now = 1_700_000_000_000;
  const code = totpCode(secret, now);
  assert.equal(verifyTotp(secret, code, now), true);
  const wrong = code === '111111' ? '222222' : '111111';
  assert.equal(verifyTotp(secret, wrong, now), false);
});

test('rules mirror denies payroll to employees and other tenants', () => {
  assert.equal(decideTenantAccess({
    role: 'EMPLOYEE', collection: 'payslips', op: 'read', sameTenant: true,
  }), false);
  assert.equal(decideTenantAccess({
    role: 'FINANCE', collection: 'payslips', op: 'read', sameTenant: true,
  }), true);
  assert.equal(decideTenantAccess({
    role: 'FINANCE', collection: 'payslips', op: 'read', sameTenant: false,
  }), false);
  assert.equal(decideTenantAccess({
    role: 'DEPARTMENT_MANAGER', collection: 'employees', op: 'read', sameTenant: true, sameDepartment: false,
  }), false);
  assert.equal(decideTenantAccess({
    role: 'DEPARTMENT_MANAGER', collection: 'employees', op: 'read', sameTenant: true, sameDepartment: true,
  }), true);
  assert.equal(decideTenantAccess({
    role: 'HR_USER', collection: 'contracts', op: 'write', sameTenant: true,
  }), false);
  assert.equal(decideTenantAccess({
    role: 'UNKNOWN', collection: 'other', op: 'read', sameTenant: true,
  }), false);
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  assert.match(rules, /function payrollRole\(\)/);
  assert.match(rules, /match \/payslips\/\{docId\}/);
  const sql = fs.readFileSync('supabase/migrations/20261015_tenant_rls.sql', 'utf8');
  assert.match(sql, /DROP POLICY IF EXISTS "leave_requests_all"/);
  assert.doesNotMatch(sql, /USING \(true\)/);
});

test('device map ignores a client company and reads only the server map', () => {
  const previous = process.env.DEVICE_TENANT_MAP;
  process.env.DEVICE_TENANT_MAP = JSON.stringify({ SN1: 'comp-from-server' });
  try {
    assert.equal(companyForDevice('SN1'), 'comp-from-server');
    assert.equal(companyForDevice('missing'), undefined);
  } finally {
    if (previous === undefined) delete process.env.DEVICE_TENANT_MAP;
    else process.env.DEVICE_TENANT_MAP = previous;
  }
});
