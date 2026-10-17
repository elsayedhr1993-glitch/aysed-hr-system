import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import test from 'node:test';
import express from 'express';
import { HR_ROLES, type HrRole } from '../../src/security/accessRoles';
import { __resetAuditLogForTests, __setAuditStoreForTests, type AuditEvent } from '../auditLog';
import { registerTenantProfileRoutes } from '../tenantProfileRoutes';
import {
  __resetPlatformStoreForTests,
  __setPlatformStoreForTests,
  type PlatformDocStore,
} from '../platformOwnerWrites';

const PROFILE_ROUTES = [
  {
    method: 'POST' as const,
    path: '/api/tenant/company-profile',
    body: { patch: { companyId: 'forged-company', nameAr: 'عيادة الجلسة', mohLicense: 'MOH-9', role: 'SUPER_ADMIN' } },
  },
  {
    method: 'POST' as const,
    path: '/api/tenant/system-integrations',
    body: {
      companyId: 'forged-company',
      publicVerificationDomain: 'https://verify.example.test',
      branches: [{ name: 'الرئيسي', latitude: 29.3, longitude: 47.9, radiusMeters: 100, isActive: true }],
      whatsAppGateway: { instanceId: 'instance-1', apiToken: 'super-secret-token', defaultCountryCode: '+965', isActive: true },
      geminiApiKey: 'gemini-secret',
    },
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
  setRole: (role: string | null, companyId?: string) => void;
  close: () => Promise<void>;
}> {
  let role: string | null = 'EMPLOYEE';
  let companyId = 'comp-session';
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (role !== null) {
      req.sessionTenant = {
        uid: `tenant-${role || 'blank'}`,
        email: 'person@example.test',
        role: role as HrRole,
        companyId,
      };
    }
    next();
  });
  registerTenantProfileRoutes(app);
  const server: Server = app.listen(0, '127.0.0.1');
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('listening', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('tenant profile test server has no port'));
        return;
      }
      resolve({
        base: `http://127.0.0.1:${address.port}`,
        setRole(next, nextCompany = 'comp-session') {
          role = next;
          companyId = nextCompany;
        },
        close: () => new Promise((done, fail) => {
          server.close((error) => (error ? fail(error) : done()));
        }),
      });
    });
  });
}

async function call(
  base: string,
  route: (typeof PROFILE_ROUTES)[number]
): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await fetch(`${base}${route.path}`, {
    method: route.method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(route.body),
  });
  const body = await response.json() as Record<string, unknown>;
  return { status: response.status, body };
}

test('tenant profile writes use the session company and reject everyone else without an audit entry', async () => {
  const events: AuditEvent[] = [];
  const store = memoryStore();
  __resetAuditLogForTests();
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
  const app = await startApp();
  try {
    const denied = [...HR_ROLES.filter((role) => role !== 'COMPANY_ADMIN' && role !== 'HR_MANAGER' && role !== 'HR_USER'), 'UNKNOWN', ''];
    for (const role of denied) {
      app.setRole(role);
      for (const route of PROFILE_ROUTES) {
        const result = await call(app.base, route);
        assert.equal(result.status, 403, `${role || '(blank)'} ${route.path}`);
        assert.equal(result.body.success, false);
      }
    }
    app.setRole('HR_USER');
    const hrIntegrations = await call(app.base, PROFILE_ROUTES[1]);
    assert.equal(hrIntegrations.status, 403);
    app.setRole('COMPANY_ADMIN', '');
    for (const route of PROFILE_ROUTES) {
      const result = await call(app.base, route);
      assert.equal(result.status, 403, `missing company ${route.path}`);
    }
    assert.equal(events.length, 0);
    assert.equal(store.docs.size, 0);

    app.setRole(null);
    for (const route of PROFILE_ROUTES) {
      const result = await call(app.base, route);
      assert.equal(result.status, 401, route.path);
    }
    assert.equal(events.length, 0);

    app.setRole('HR_USER', 'comp-session');
    const hrPam = await call(app.base, {
      method: 'POST',
      path: '/api/tenant/company-profile',
      body: { patch: { pamOverlayCoords: { employeeName: { x: 1, y: 2 } }, pamFontChoice: 'cairo' } },
    });
    assert.equal(hrPam.status, 403);
    assert.equal(events.length, 0);

    app.setRole('HR_MANAGER', 'comp-session');
    const profile = await call(app.base, PROFILE_ROUTES[0]);
    assert.equal(profile.status, 200);
    assert.equal(profile.body.companyId, 'comp-session');
    assert.equal(store.docs.has('companies/forged-company'), false);
    assert.equal(store.docs.get('companies/comp-session')?.nameAr, 'عيادة الجلسة');
    assert.equal(store.docs.get('companies/comp-session')?.mohLicense, 'MOH-9');
    assert.equal(store.docs.get('companies/comp-session')?.role, undefined);
    assert.equal(store.docs.get('companies/comp-session')?.companyId, undefined);

    app.setRole('COMPANY_ADMIN', 'comp-session');
    const integrations = await call(app.base, PROFILE_ROUTES[1]);
    assert.equal(integrations.status, 200);
    assert.equal(integrations.body.tokenStored, true);
    assert.equal(JSON.stringify(integrations.body).includes('super-secret-token'), false);
    assert.equal(JSON.stringify(integrations.body).includes('gemini-secret'), false);
    const saved = store.docs.get('system_integrations/comp-session');
    const gateway = saved?.whatsAppGateway as { apiToken?: string } | undefined;
    assert.equal(gateway?.apiToken, 'super-secret-token');
    assert.equal(saved?.companyId, 'comp-session');
    assert.equal(saved?.geminiApiKey, 'gemini-secret');
    assert.equal(store.docs.has('system_integrations/forged-company'), false);
    assert.equal(JSON.stringify(events).includes('super-secret-token'), false);
    assert.equal(JSON.stringify(events).includes('gemini-secret'), false);
    assert.equal(events.every((event) => event.companyId === 'comp-session'), true);
  } finally {
    __setPlatformStoreForTests(null);
    __resetPlatformStoreForTests();
    __setAuditStoreForTests(null);
    __resetAuditLogForTests();
    await app.close();
  }
});
