import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import test from 'node:test';
import express from 'express';
import { HR_ROLES, type HrRole } from '../../src/security/accessRoles';
import { __resetAuditLogForTests, __setAuditStoreForTests, type AuditEvent } from '../auditLog';
import { registerPlatformRoutes } from '../platformRoutes';
import {
  __resetPlatformStoreForTests,
  __setPlatformStoreForTests,
  type PlatformDocStore,
} from '../platformOwnerWrites';
import { __resetStudioStoreForTests } from '../studioOverrides';

const DENIED_ROLES: readonly string[] = [
  ...HR_ROLES.filter((role) => role !== 'SUPER_ADMIN'),
  'UNKNOWN',
  'TENANT_ADMIN',
  'DEPT_MANAGER',
  '',
];

const ROUTES: ReadonlyArray<{ method: 'POST' | 'PUT' | 'GET'; path: string; body?: Record<string, unknown> }> = [
  {
    method: 'POST',
    path: '/api/platform/companies',
    body: {
      companyName: 'عيادة التجربة',
      requesterName: 'مسؤول',
      email: 'admin@example.test',
      phone: '50000000',
      planType: 'medical',
      empCount: '11-50',
      initialStatus: 'approved',
    },
  },
  {
    method: 'POST',
    path: '/api/platform/facility-admins',
    body: {
      email: 'admin@example.test',
      displayName: 'مسؤول',
      companyId: 'comp-test',
      companyName: 'عيادة التجربة',
    },
  },
  {
    method: 'POST',
    path: '/api/platform/subscription-requests/approve',
    body: {
      requestId: 'req-1',
      companyId: 'comp-test',
      companyName: 'عيادة التجربة',
      requesterName: 'مسؤول',
      email: 'admin@example.test',
      phone: '50000000',
      planType: 'medical',
    },
  },
  {
    method: 'POST',
    path: '/api/platform/subscription-requests/suspend',
    body: { requestId: 'req-1' },
  },
  {
    method: 'POST',
    path: '/api/platform/subscription-requests/archive',
    body: { requestId: 'req-1' },
  },
  {
    method: 'POST',
    path: '/api/platform/subscription-requests/update',
    body: {
      rowId: 'req-edit',
      companyId: 'comp-test',
      companyName: 'عيادة التجربة',
      requesterName: 'مسؤول',
      email: 'admin@example.test',
      phone: '50000000',
      planType: 'medical',
      empCount: '11-50',
      state: 'approved',
    },
  },
  {
    method: 'GET',
    path: '/api/platform/subscription-requests',
  },
  {
    method: 'POST',
    path: '/api/platform/facility-users',
    body: {
      companyId: 'comp-test',
      email: 'admin@example.test',
      displayName: 'مسؤول',
      companyName: 'عيادة التجربة',
      uid: 'usr-edit',
      isActive: true,
      status: 'active',
    },
  },
  {
    method: 'POST',
    path: '/api/platform/pam-form',
    body: {
      pamOverlayCoords: { employeeName: { x: 10, y: 20 } },
      pamFontChoice: 'cairo',
      pamOverlaySchemaVersion: 2,
    },
  },
  {
    method: 'PUT',
    path: '/api/platform/custom-layouts',
    body: {
      companyId: 'comp-test',
      screenId: 'employees',
      layout: { version: 1, tabs: [], fields: [], customFields: [] },
    },
  },
  {
    method: 'PUT',
    path: '/api/platform/ui-overrides',
    body: { companyId: 'comp-test', patches: { 'launcher.app.PAYROLL': { hidden: true } } },
  },
  {
    method: 'POST',
    path: '/api/platform/ui-overrides/reset',
    body: { companyId: 'comp-test', key: 'launcher.app.PAYROLL' },
  },
  {
    method: 'POST',
    path: '/api/platform/compliance/delete',
    body: { companyId: 'comp-test' },
  },
  {
    method: 'POST',
    path: '/api/platform/system-config/delete',
    body: { companyId: 'comp-test' },
  },
  {
    method: 'POST',
    path: '/api/platform/system-config/keys',
    body: {
      apiKey: 'public-client-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-aysed',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '1',
      appId: '1:1:web:abc',
      geminiApiKey: 'should-not-store',
    },
  },
  {
    method: 'GET',
    path: '/api/platform/system-config/keys',
  },
  {
    method: 'POST',
    path: '/api/platform/backup/restore',
    body: {
      companies: [{ id: 'comp-restore', companyName: 'عيادة الاستعادة', password: 'secret-pass' }],
      subscriptions: [{ id: 'req-restore', companyId: 'comp-restore', adminPassword: 'secret-pass' }],
    },
  },
  {
    method: 'POST',
    path: '/api/platform/tenants/purge',
    body: { id: 'req-purge', companyId: 'comp-purge', email: 'gone@example.test', name: 'منشأة الحذف' },
  },
];

function memoryStore(): PlatformDocStore & { docs: Map<string, Record<string, unknown>> } {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    async merge(path, data) {
      docs.set(path, { ...(docs.get(path) || {}), ...data });
    },
    async remove(path) {
      docs.delete(path);
    },
    async list(collectionPath) {
      const prefix = collectionPath.replace(/\/$/, '');
      return [...docs.keys()].filter((path) => path.slice(0, path.lastIndexOf('/')) === prefix);
    },
    async read(path) {
      const data = docs.get(path);
      return data ? { ...data } : null;
    },
    async whereIn(collectionPath, field, values) {
      const prefix = collectionPath.replace(/\/$/, '');
      const wanted = new Set(values);
      return [...docs.entries()]
        .filter(([path, data]) => path.slice(0, path.lastIndexOf('/')) === prefix && wanted.has(String(data[field] ?? '')))
        .map(([path]) => path);
    },
  };
}

function startApp(): Promise<{
  base: string;
  setRole: (role: string | null) => void;
  close: () => Promise<void>;
}> {
  let role: string | null = 'EMPLOYEE';
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (role !== null) {
      req.sessionTenant = {
        uid: `platform-${role || 'blank'}`,
        email: 'person@example.test',
        role: role as HrRole,
        companyId: 'comp-session',
      };
    }
    next();
  });
  registerPlatformRoutes(app);
  const server: Server = app.listen(0, '127.0.0.1');
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('listening', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('platform test server has no port'));
        return;
      }
      resolve({
        base: `http://127.0.0.1:${address.port}`,
        setRole(next) {
          role = next;
        },
        close: () => new Promise((done, fail) => {
          server.close((error) => (error ? fail(error) : done()));
        }),
      });
    });
  });
}

test('platform owner writes reject every other session role with 403 and record an audit entry for the owner', async () => {
  const events: AuditEvent[] = [];
  const store = memoryStore();
  __resetAuditLogForTests();
  __resetStudioStoreForTests();
  __resetPlatformStoreForTests();
  __setAuditStoreForTests({
    async append(event) {
      events.push(event);
    },
    async listAll() {
      return events.map((event) => ({ ...event }));
    },
  });
  __setPlatformStoreForTests(store);
  await store.merge('companies/comp-test/compliance/licences', { companyId: 'comp-test' });
  await store.merge('system_config/leave_policy_comp-test', { companyId: 'comp-test' });
  await store.merge('companies/comp-purge', { companyId: 'comp-purge', companyName: 'منشأة الحذف' });
  await store.merge('employees/emp-purge', { companyId: 'comp-purge' });
  await store.merge('employees/emp-keep', { companyId: 'comp-keep' });
  await store.merge('subscription_requests/req-purge', { companyId: 'comp-purge' });
  const seeded = store.docs.size;

  const app = await startApp();
  try {
    for (const role of DENIED_ROLES) {
      app.setRole(role);
      for (const route of ROUTES) {
        const response = await fetch(`${app.base}${route.path}`, {
          method: route.method,
          headers: { 'content-type': 'application/json' },
          body: route.body ? JSON.stringify(route.body) : undefined,
        });
        assert.equal(response.status, 403, `${role || '(blank)'} ${route.method} ${route.path}`);
        const body = await response.json() as { success?: boolean };
        assert.equal(body.success, false);
      }
    }
    assert.equal(events.length, 0);
    assert.equal(store.docs.size, seeded);
    assert.equal(store.docs.has('companies/comp-test/compliance/licences'), true);
    assert.equal(store.docs.has('system_config/leave_policy_comp-test'), true);
    assert.equal(store.docs.has('employees/emp-purge'), true);
    assert.equal(store.docs.has('employees/emp-keep'), true);

    app.setRole(null);
    for (const route of ROUTES) {
      const anonymous = await fetch(`${app.base}${route.path}`, {
        method: route.method,
        headers: { 'content-type': 'application/json' },
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      assert.equal(anonymous.status, 401, `${route.method} ${route.path}`);
      assert.equal(events.length, 0);
    }

    app.setRole('SUPER_ADMIN');
    for (const route of ROUTES) {
      const response = await fetch(`${app.base}${route.path}`, {
        method: route.method,
        headers: { 'content-type': 'application/json' },
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      const body = await response.json() as { success?: boolean; error?: string; temporaryPassword?: string };
      assert.equal(response.status, 200, `${route.path} ${body.error || ''}`);
      assert.equal(body.success, true);
      assert.equal(body.temporaryPassword === undefined || !JSON.stringify(events).includes(String(body.temporaryPassword)), true);
    }

    assert.equal(store.docs.has('companies/comp-test/compliance/licences'), false);
    assert.equal(store.docs.has('system_config/leave_policy_comp-test'), false);
    assert.equal([...store.docs.keys()].some((path) => path.startsWith('companies/comp_')), true);
    assert.equal([...store.docs.keys()].some((path) => path.startsWith('subscriptions/sub_')), true);
    assert.equal([...store.docs.keys()].some((path) => path.startsWith('subscription_requests/')), true);
    assert.equal([...store.docs.keys()].some((path) => path.startsWith('users/')), true);
    const user = [...store.docs.entries()].find(([path]) => path.startsWith('users/'))?.[1];
    assert.equal(user?.role, 'COMPANY_ADMIN');
    assert.equal(store.docs.get('subscription_requests/req-1')?.status, 'suspended');
    assert.equal(store.docs.get('subscription_requests/req-1')?.archived, true);
    assert.equal(store.docs.has('companies/comp-test/custom_layouts/employees'), true);

    const entityTypes = new Set(events.map((event) => event.entityType));
    assert.equal(entityTypes.has('company'), true);
    assert.equal(entityTypes.has('users'), true);
    assert.equal(entityTypes.has('subscription_requests'), true);
    assert.equal(entityTypes.has('custom_layouts'), true);
    assert.equal(entityTypes.has('ui_override'), true);
    assert.equal(entityTypes.has('compliance'), true);
    assert.equal(entityTypes.has('system_config'), true);
    assert.equal(events.some((event) => event.details === 'الموافقة على طلب الاشتراك'), true);
    assert.equal(events.some((event) => event.details === 'حفظ مفاتيح النظام'), true);
    assert.equal(events.some((event) => event.details === 'استعادة نسخة احتياطية'), true);
    assert.equal(events.some((event) => event.details === 'حذف متتالي لمنشأة'), true);
    assert.equal(events.every((event) => event.role === 'SUPER_ADMIN'), true);
    assert.equal(JSON.stringify(events).includes('temporaryPassword'), false);
    assert.equal(JSON.stringify(events).includes('should-not-store'), false);
    assert.equal(JSON.stringify(events).includes('secret-pass'), false);
    const keys = store.docs.get('system_config/keys');
    assert.equal(keys?.projectId, 'demo-aysed');
    assert.equal(keys?.geminiApiKey, '');
    assert.equal(JSON.stringify(keys).includes('should-not-store'), false);
    assert.equal(store.docs.get('companies/comp-restore')?.companyName, 'عيادة الاستعادة');
    assert.equal(store.docs.get('companies/comp-restore')?.password, undefined);
    assert.equal(store.docs.get('subscription_requests/req-restore')?.companyId, 'comp-restore');
    assert.equal(store.docs.get('subscription_requests/req-restore')?.adminPassword, undefined);
    assert.equal(store.docs.has('employees/emp-purge'), false);
    assert.equal(store.docs.has('companies/comp-purge'), false);
    assert.equal(store.docs.has('subscription_requests/req-purge'), false);
    assert.equal(store.docs.has('employees/emp-keep'), true);
    assert.equal([...store.docs.keys()].some((path) => path.startsWith('purged_tenants/')), true);
    assert.equal(store.docs.get('subscription_requests/req-edit')?.state, 'approved');
    assert.equal(store.docs.get('subscription_requests/req-edit')?.companyId, 'comp-test');
    assert.equal(store.docs.get('users/usr-edit')?.role, 'COMPANY_ADMIN');
    assert.equal(store.docs.get('users/usr-edit')?.companyId, 'comp-test');
    assert.equal(store.docs.get('platform_settings/pam_form_2')?.pamFontChoice, 'cairo');
    assert.equal(events.some((event) => event.details === 'تعديل طلب الاشتراك'), true);
    assert.equal(events.some((event) => event.details === 'إنشاء أو تعديل مستخدمي المنشأة'), true);
    assert.equal(events.some((event) => event.details === 'حفظ إحداثيات عقد المنصة'), true);
  } finally {
    __setPlatformStoreForTests(null);
    __resetPlatformStoreForTests();
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
    __resetStudioStoreForTests();
    await app.close();
  }
});
