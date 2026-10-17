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

const ROUTES: ReadonlyArray<{ method: 'POST' | 'PUT'; path: string; body: Record<string, unknown> }> = [
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
  const seeded = store.docs.size;

  const app = await startApp();
  try {
    for (const role of DENIED_ROLES) {
      app.setRole(role);
      for (const route of ROUTES) {
        const response = await fetch(`${app.base}${route.path}`, {
          method: route.method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(route.body),
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

    app.setRole(null);
    const anonymous = await fetch(`${app.base}/api/platform/companies`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ROUTES[0].body),
    });
    assert.equal(anonymous.status, 401);

    app.setRole('SUPER_ADMIN');
    for (const route of ROUTES) {
      const response = await fetch(`${app.base}${route.path}`, {
        method: route.method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(route.body),
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
    assert.equal(events.every((event) => event.role === 'SUPER_ADMIN'), true);
    assert.equal(JSON.stringify(events).includes('temporaryPassword'), false);
  } finally {
    __setPlatformStoreForTests(null);
    __resetPlatformStoreForTests();
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
    __resetStudioStoreForTests();
    await app.close();
  }
});
