import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { decideTenantAccess } from '../../src/security/accessRoles';
import { maskAuditSnapshot } from '../../src/security/auditMask';
import {
  __resetAuditLogForTests,
  listAuditEvents,
  recordAuditEvent,
} from '../auditLog';

test('civil id and salary are masked and company id is the session value', () => {
  __resetAuditLogForTests();
  const event = recordAuditEvent({
    actor: { uid: 'u1', name: 'مراجع', role: 'COMPANY_ADMIN' },
    action: 'update',
    entityType: 'employee',
    entityId: 'emp-1',
    before: { civilId: '293080106877', basicSalary: 450, companyId: 'forged', nameAr: 'لا يُحفظ' },
    after: { civil_id: '293080106877', totalSalary: 900, companyId: 'also-forged' },
    ip: '10.0.0.8',
    sessionCompanyId: 'comp-session',
  });
  assert.equal(event.companyId, 'comp-session');
  assert.equal(event.before?.basicSalary, '•••');
  assert.equal(String(event.before?.civilId).includes('293080106'), false);
  assert.equal(String(event.before?.civilId).endsWith('877'), true);
  assert.equal(event.before?.companyId, undefined);
  assert.equal(event.before?.nameAr, undefined);
  assert.equal(event.after?.totalSalary, '•••');
  assert.equal(maskAuditSnapshot({ salary: 10 })?.salary, '•••');
});

test('audit log rejects update and delete for every role and has no mutation api', () => {
  for (const role of ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'HR_USER', 'EMPLOYEE', 'FINANCE', 'UNKNOWN']) {
    assert.equal(decideTenantAccess({
      role,
      collection: 'audit_logs',
      op: 'update',
      sameTenant: true,
      platformAdmin: role === 'SUPER_ADMIN',
    }), false);
    assert.equal(decideTenantAccess({
      role,
      collection: 'audit_logs',
      op: 'delete',
      sameTenant: true,
      platformAdmin: role === 'SUPER_ADMIN',
    }), false);
  }

  const rules = fs.readFileSync('firestore.rules', 'utf8');
  const block = rules.slice(rules.indexOf('match /audit_logs/'), rules.indexOf('match /work_on_holidays/'));
  assert.match(block, /allow update, delete: if false;/);
  assert.doesNotMatch(block, /allow update, delete: if isSuperAdmin/);

  const routes = fs.readFileSync('server/auditRoutes.ts', 'utf8');
  assert.doesNotMatch(routes, /app\.(put|patch|delete)\(/);
  const store = fs.readFileSync('server/auditLog.ts', 'utf8');
  assert.doesNotMatch(store, /function updateAudit|function deleteAudit|events\.splice|events\.pop\(/);

  __resetAuditLogForTests();
  const now = Date.now();
  const first = recordAuditEvent({
    actor: { uid: 'admin', name: 'مسؤول', role: 'COMPANY_ADMIN' },
    action: 'create',
    entityType: 'employee',
    entityId: 'emp-1',
    sessionCompanyId: 'comp-a',
    at: new Date(now).toISOString(),
  });
  recordAuditEvent({
    actor: { uid: 'other', role: 'COMPANY_ADMIN' },
    action: 'delete',
    entityType: 'contract',
    entityId: 'c-2',
    sessionCompanyId: 'comp-b',
    at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });
  recordAuditEvent({
    actor: { uid: 'old', role: 'SUPER_ADMIN' },
    action: 'login',
    entityType: 'session',
    entityId: 'old',
    sessionCompanyId: '',
    at: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const own = listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a', now });
  assert.equal(own.scope, 'company');
  assert.equal(own.total, 1);
  assert.equal(own.events[0].id, first.id);
  assert.equal(own.events[0].action, 'create');

  const platform = listAuditEvents({
    viewerRole: 'SUPER_ADMIN',
    sessionCompanyId: 'comp-a',
    from: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    now,
  });
  assert.equal(platform.scope, 'platform');
  assert.equal(platform.total, 3);

  const recentPlatform = listAuditEvents({ viewerRole: 'SUPER_ADMIN', now });
  assert.equal(recentPlatform.total, 2);

  const exported = recordAuditEvent({
    actor: { uid: 'admin', role: 'COMPANY_ADMIN' },
    action: 'export',
    entityType: 'audit_log',
    entityId: 'audit_log',
    sessionCompanyId: 'comp-a',
    at: new Date(now).toISOString(),
  });
  const afterExport = listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a', now });
  assert.equal(afterExport.events.some((row) => row.id === exported.id), true);
  assert.equal(afterExport.events.some((row) => row.id === first.id), true);
});
