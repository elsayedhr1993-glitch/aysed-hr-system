import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { decideTenantAccess } from '../../src/security/accessRoles';
import { maskAuditDetails, maskAuditSnapshot } from '../../src/security/auditMask';
import { captureBatchBefores } from '../../src/services/auditBatch';
import { logAction } from '../../src/lib/audit';
import { __setAuditReportSenderForTests } from '../../src/services/auditClient';
import {
  __resetAuditLogForTests,
  __setAuditStoreForTests,
  auditPersistenceMode,
  listAuditAlerts,
  listAuditEvents,
  recordAuditEvent,
  type AuditEvent,
} from '../auditLog';

test('civil id and salary are masked and company id is the session value', async () => {
  __resetAuditLogForTests();
  __setAuditStoreForTests(null);
  const event = await recordAuditEvent({
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

test('audit log rejects update and delete for every role and has no mutation api', async () => {
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
  assert.match(block, /allow create, update, delete: if false;/);
  assert.doesNotMatch(block, /allow update, delete: if isSuperAdmin/);

  const routes = fs.readFileSync('server/auditRoutes.ts', 'utf8');
  assert.doesNotMatch(routes, /app\.(put|patch|delete)\(/);
  const store = fs.readFileSync('server/auditLog.ts', 'utf8');
  assert.doesNotMatch(store, /function updateAudit|function deleteAudit|events\.splice|events\.pop\(/);

  __resetAuditLogForTests();
  __setAuditStoreForTests(null);
  const now = Date.now();
  const first = await recordAuditEvent({
    actor: { uid: 'admin', name: 'مسؤول', role: 'COMPANY_ADMIN' },
    action: 'create',
    entityType: 'employee',
    entityId: 'emp-1',
    sessionCompanyId: 'comp-a',
    at: new Date(now).toISOString(),
  });
  await recordAuditEvent({
    actor: { uid: 'other', role: 'COMPANY_ADMIN' },
    action: 'delete',
    entityType: 'contract',
    entityId: 'c-2',
    sessionCompanyId: 'comp-b',
    at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });
  await recordAuditEvent({
    actor: { uid: 'old', role: 'SUPER_ADMIN' },
    action: 'login',
    entityType: 'session',
    entityId: 'old',
    sessionCompanyId: '',
    at: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const own = await listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a', now });
  assert.equal(own.scope, 'company');
  assert.equal(own.total, 1);
  assert.equal(own.events[0].id, first.id);
  assert.equal(own.events[0].action, 'create');

  const platform = await listAuditEvents({
    viewerRole: 'SUPER_ADMIN',
    sessionCompanyId: 'comp-a',
    from: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    now,
  });
  assert.equal(platform.scope, 'platform');
  assert.equal(platform.total, 3);

  const recentPlatform = await listAuditEvents({ viewerRole: 'SUPER_ADMIN', now });
  assert.equal(recentPlatform.total, 2);

  const exported = await recordAuditEvent({
    actor: { uid: 'admin', role: 'COMPANY_ADMIN' },
    action: 'export',
    entityType: 'audit_log',
    entityId: 'audit_log',
    sessionCompanyId: 'comp-a',
    at: new Date(now).toISOString(),
  });
  const afterExport = await listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a', now });
  assert.equal(afterExport.events.some((row) => row.id === exported.id), true);
  assert.equal(afterExport.events.some((row) => row.id === first.id), true);
});

test('localhost without the emulator stays in memory and other runtimes use firestore', () => {
  assert.equal(auditPersistenceMode({ NODE_ENV: 'development' }), 'memory');
  assert.equal(auditPersistenceMode({ NODE_ENV: 'test' }), 'memory');
  assert.equal(auditPersistenceMode({ NODE_ENV: 'development', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }), 'firestore');
  assert.equal(auditPersistenceMode({ VITE_USE_EMULATOR: 'true' }), 'firestore');
  assert.equal(auditPersistenceMode({ NODE_ENV: 'production' }), 'firestore');
  assert.equal(auditPersistenceMode({ VERCEL: '1' }), 'firestore');
});

test('a durable audit event survives a simulated restart and cannot be updated or deleted', async () => {
  const docs = new Map<string, AuditEvent>();
  const durable = {
    async append(event: AuditEvent) {
      if (docs.has(event.id)) throw new Error('already exists');
      docs.set(event.id, { ...event });
    },
    async listAll() {
      return [...docs.values()].map((event) => ({ ...event }));
    },
  };
  __resetAuditLogForTests();
  __setAuditStoreForTests(durable);
  try {
    const event = await recordAuditEvent({
      actor: { uid: 'u1', name: 'مراجع', role: 'COMPANY_ADMIN' },
      action: 'update',
      entityType: 'employee',
      entityId: 'emp-9',
      before: { civilId: '293080106877', basicSalary: 450 },
      sessionCompanyId: 'comp-a',
    });
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
    const afterRestartMemory = await listAuditEvents({ viewerRole: 'SUPER_ADMIN' });
    assert.equal(afterRestartMemory.events.some((row) => row.id === event.id), false);
    __setAuditStoreForTests(durable);
    const restored = await listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a' });
    assert.equal(restored.events.some((row) => row.id === event.id), true);
    assert.equal(restored.events.find((row) => row.id === event.id)?.before?.basicSalary, '•••');
    assert.equal(typeof (durable as { update?: unknown }).update, 'undefined');
    assert.equal(typeof (durable as { delete?: unknown }).delete, 'undefined');
    await assert.rejects(() => durable.append(event), /already exists/);
    const adapter = fs.readFileSync('server/auditFirestoreStore.ts', 'utf8');
    assert.match(adapter, /\.create\(/);
    assert.doesNotMatch(adapter, /\.update\(|\.delete\(/);
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    const block = rules.slice(rules.indexOf('match /audit_logs/'), rules.indexOf('match /work_on_holidays/'));
    assert.match(block, /allow create, update, delete: if false;/);
  } finally {
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
  }
});

test('a failed audit append does not throw and raises an alert', async () => {
  __resetAuditLogForTests();
  __setAuditStoreForTests({
    async append() {
      throw new Error('disk full');
    },
    async listAll() {
      return [];
    },
  });
  try {
    const event = await recordAuditEvent({
      actor: { uid: 'u1', role: 'HR_MANAGER' },
      action: 'create',
      entityType: 'contract',
      entityId: 'c-1',
      sessionCompanyId: 'comp-a',
    });
    assert.ok(event.id);
    const alerts = listAuditAlerts();
    assert.equal(alerts.length, 1);
    assert.match(alerts[0].message, /disk full/);
  } finally {
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
  }
});

test('logAction writes through the central recorder and masks details', async () => {
  __resetAuditLogForTests();
  __setAuditStoreForTests(null);
  __setAuditReportSenderForTests(async (input) => {
    await recordAuditEvent({
      actor: { uid: 'user-1', name: input.userName, role: 'COMPANY_ADMIN' },
      action: input.action as 'create',
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      sessionCompanyId: 'comp-a',
    });
  });
  try {
    const ok = await logAction({ id: 'user-1', name: 'نورة' }, 'create', 'employee', 'emp-9', 'civil 293080106877');
    assert.equal(ok, true);
    const page = await listAuditEvents({ viewerRole: 'COMPANY_ADMIN', sessionCompanyId: 'comp-a' });
    assert.equal(page.total, 1);
    assert.equal(page.events[0].entityId, 'emp-9');
    assert.equal(page.events[0].details.includes('293080106877'), false);
    assert.equal(maskAuditDetails('293080106877').includes('293080106'), false);
  } finally {
    __setAuditReportSenderForTests(null);
    __resetAuditLogForTests();
  }
});

test('batch befores are captured before commit and sensitive fields are masked', async () => {
  let committed = false;
  const priors = await captureBatchBefores([{ ref: 'employees/1' }], async () => {
    assert.equal(committed, false);
    return { known: true, data: { basicSalary: 450, civilId: '293080106877', nameAr: 'مخفي' } };
  });
  committed = true;
  const masked = maskAuditSnapshot(priors[0].data);
  assert.equal(masked?.basicSalary, '•••');
  assert.equal(String(masked?.civilId).includes('293080106'), false);
  assert.equal(masked?.nameAr, undefined);
});
