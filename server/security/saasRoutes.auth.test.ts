import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import test from 'node:test';
import express from 'express';
import { HR_ROLES, type HrRole } from '../../src/security/accessRoles';
import { __resetAuditLogForTests, __setAuditStoreForTests } from '../auditLog';
import { endImpersonation } from '../impersonationStore';
import { registerSaasRoutes } from '../saasRoutes';
import '../tenantScope';

/** Every session role except the platform owner, plus aliases that normalize away from SUPER_ADMIN. */
const DENIED_ROLES: readonly string[] = [
  ...HR_ROLES.filter((role) => role !== 'SUPER_ADMIN'),
  'UNKNOWN',
  'TENANT_ADMIN',
  'DEPT_MANAGER',
  '',
];

const PROTECTED_ROUTES = [
  { method: 'GET', path: '/api/admin/impersonate' },
  { method: 'POST', path: '/api/admin/impersonate' },
  { method: 'POST', path: '/api/admin/impersonate/break-glass' },
] as const;

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
        uid: `saas-${role || 'blank'}`,
        email: 'person@example.test',
        role: role as HrRole,
        companyId: 'comp-test',
      };
    }
    next();
  });
  registerSaasRoutes(app);
  const server: Server = app.listen(0, '127.0.0.1');
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('listening', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('saas test server has no port'));
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

test('saas routes reject every role except the platform owner with 403', async () => {
  const events: unknown[] = [];
  __resetAuditLogForTests();
  __setAuditStoreForTests({
    async append(event) {
      events.push(event);
    },
    async listAll() {
      return [];
    },
  });
  const app = await startApp();
  try {
    for (const role of DENIED_ROLES) {
      app.setRole(role);
      for (const route of PROTECTED_ROUTES) {
        const response = await fetch(`${app.base}${route.path}`, {
          method: route.method,
          headers: { 'content-type': 'application/json' },
          body: route.method === 'POST'
            ? JSON.stringify({ companyId: 'comp-other', reason: 'تجربة' })
            : undefined,
        });
        assert.equal(response.status, 403, `${role || '(blank)'} ${route.method} ${route.path}`);
        const body = await response.json() as { success?: boolean };
        assert.equal(body.success, false);
      }
      endImpersonation(`saas-${role || 'blank'}`);
    }
    assert.equal(events.length, 0);

    app.setRole(null);
    const anonymous = await fetch(`${app.base}/api/admin/impersonate`);
    assert.equal(anonymous.status, 401);

    app.setRole('SUPER_ADMIN');
    const allowed = await fetch(`${app.base}/api/admin/impersonate`);
    assert.equal(allowed.status, 200);
    const ownerBody = await allowed.json() as { success?: boolean };
    assert.equal(ownerBody.success, true);

    const probe = await fetch(`${app.base}/api/saas/access`);
    assert.equal(probe.status, 200);
    const probeBody = await probe.json() as { platformOwner?: boolean };
    assert.equal(probeBody.platformOwner, true);
    app.setRole('COMPANY_ADMIN');
    const hidden = await fetch(`${app.base}/api/saas/access`);
    assert.equal(hidden.status, 200);
    const hiddenBody = await hidden.json() as { platformOwner?: boolean };
    assert.equal(hiddenBody.platformOwner, false);
  } finally {
    for (const role of [...DENIED_ROLES, 'SUPER_ADMIN']) endImpersonation(`saas-${role || 'blank'}`);
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
    await app.close();
  }
});
