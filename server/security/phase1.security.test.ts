import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { decideTenantAccess, RULED_COLLECTIONS } from '../../src/security/accessRoles';
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
import { companyIdFromRegistration } from '../../src/security/deviceCompany';
import {
  __resetDeviceAttemptsForTests,
  __setDeviceRecordLoaderForTests,
  recordUnregisteredDeviceAttempt,
  resolveRegisteredDeviceCompany,
  unregisteredDeviceAttemptCount,
} from '../deviceRegistry';
import { localAuthWriteBypassEnabled } from '../localAuthBypass';

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
  assert.match(rules, /function hrRead\(\)/);
  assert.match(rules, /match \/payslips\/\{docId\}/);
  assert.doesNotMatch(rules, /allow read: if canReadTenantDoc\(\);/);
  for (const name of RULED_COLLECTIONS) {
    assert.match(rules, new RegExp(`match /${name}/`));
    assert.equal(decideTenantAccess({
      role: 'UNKNOWN', collection: name, op: 'read', sameTenant: true,
    }), false);
    assert.equal(decideTenantAccess({
      role: 'HR_USER', collection: name, op: 'read', sameTenant: false,
    }), false);
    assert.equal(decideTenantAccess({
      role: 'EMPLOYEE', collection: name, op: 'read', sameTenant: false,
    }), false);
  }
  for (const name of ['commencements', 'documents', 'attendance', 'custodies', 'candidates', 'biometric_devices'] as const) {
    assert.equal(decideTenantAccess({ role: 'HR_USER', collection: name, op: 'read', sameTenant: true }), true);
    assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: name, op: 'read', sameTenant: true }), false);
    assert.equal(decideTenantAccess({ role: 'FINANCE', collection: name, op: 'write', sameTenant: true }), false);
    assert.equal(decideTenantAccess({ role: 'HR_MANAGER', collection: name, op: 'write', sameTenant: true }), true);
  }
  assert.equal(decideTenantAccess({ role: 'HR_USER', collection: 'loans', op: 'read', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'FINANCE', collection: 'leave_settlements', op: 'read', sameTenant: true }), true);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'leave_requests', op: 'read', sameTenant: true, ownRecord: true }), true);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'leave_requests', op: 'read', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'HR_USER', collection: 'audit_logs', op: 'read', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'HR_MANAGER', collection: 'audit_logs', op: 'read', sameTenant: true }), true);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'companies', op: 'read', sameTenant: true }), true);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'companies', op: 'write', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'COMPANY_ADMIN', collection: 'subscriptions', op: 'read', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'COMPANY_ADMIN', collection: 'system_config', op: 'write', sameTenant: true }), true);
  assert.equal(decideTenantAccess({ role: 'HR_USER', collection: 'system_config', op: 'write', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'users', op: 'read', sameTenant: true }), false);
  assert.equal(decideTenantAccess({ role: 'EMPLOYEE', collection: 'users', op: 'read', sameTenant: true, ownRecord: true }), true);
  const sql = fs.readFileSync('supabase/migrations/20261015_tenant_rls.sql', 'utf8');
  assert.match(sql, /DROP POLICY IF EXISTS "leave_requests_all"/);
  assert.doesNotMatch(sql, /USING \(true\)/);
});

test('device company comes from registration and rejected facilities are ignored', async () => {
  assert.equal(companyIdFromRegistration({ serial: 'SN1', token: 't', companyId: 'comp-real' }, { serial: 'SN1' }), 'comp-real');
  assert.equal(companyIdFromRegistration({ serial: 'SN1', token: 't', companyId: 'comp-real' }, { token: 't' }), 'comp-real');
  assert.equal(companyIdFromRegistration({ serial: 'SN1', companyId: 'default' }, { serial: 'SN1' }), undefined);
  assert.equal(companyIdFromRegistration({ serial: 'SN1', companyId: 'comp-clinic-01' }, { serial: 'SN1' }), undefined);
  assert.equal(companyIdFromRegistration({ serial: 'SN1', companyId: 'ALL' }, { serial: 'SN1' }), undefined);
  assert.equal(companyIdFromRegistration({ serial: 'SN1', companyId: 'comp-real' }, { serial: 'OTHER' }), undefined);
  __resetDeviceAttemptsForTests();
  __setDeviceRecordLoaderForTests(async () => []);
  try {
    assert.equal(await resolveRegisteredDeviceCompany({ serial: 'MISSING' }), undefined);
    recordUnregisteredDeviceAttempt('/iclock/cdata', 'MISSING');
    assert.equal(unregisteredDeviceAttemptCount() > 0, true);
  } finally {
    __setDeviceRecordLoaderForTests(null);
    __resetDeviceAttemptsForTests();
  }
  const server = fs.readFileSync('server.ts', 'utf8');
  assert.doesNotMatch(server, /comp-clinic-01/);
  assert.doesNotMatch(server, /companyForDevice/);
  assert.match(server, /resolveRegisteredDeviceCompany/);
});

test('local totp and password bypass is disabled in production and ignores host headers', () => {
  assert.equal(localAuthWriteBypassEnabled({ NODE_ENV: 'production' }), false);
  assert.equal(localAuthWriteBypassEnabled({ NODE_ENV: 'development', VERCEL: '1' }), false);
  assert.equal(localAuthWriteBypassEnabled({ NODE_ENV: 'test' }), true);
  assert.equal(localAuthWriteBypassEnabled({ NODE_ENV: 'development', VERCEL: '' }), true);
  const source = fs.readFileSync('server/localAuthBypass.ts', 'utf8');
  assert.doesNotMatch(source, /x-forwarded|hostname|\bhost\b/i);
  const server = fs.readFileSync('server.ts', 'utf8');
  const bypassAt = server.indexOf('localAuthWriteBypassEnabled');
  const hostAt = server.indexOf('req.hostname');
  assert.ok(bypassAt > 0 && hostAt > bypassAt);
});
