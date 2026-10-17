import type { Express, Request, Response } from 'express';
import { requestIp } from './auditLog';
import { PlatformAdminUnavailable, type PlatformActor } from './platformOwnerWrites';
import {
  companyAdminRole,
  companyProfileRoleAllowed,
  mergeSessionCompanyProfile,
  saveSessionIntegrations,
} from './tenantProfileWrites';

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function sessionActor(req: Request, res: Response, allowed: (role: string | undefined) => boolean): PlatformActor | null {
  const tenant = req.sessionTenant;
  if (!tenant) {
    deny(res, 401, 'Unauthorized');
    return null;
  }
  if (!allowed(tenant.role) || !String(tenant.companyId || '').trim()) {
    deny(res, 403, 'Unauthorized');
    return null;
  }
  return {
    uid: tenant.uid,
    email: tenant.email,
    role: tenant.role,
    companyId: tenant.companyId,
    ip: requestIp(req),
  };
}

function send(res: Response, result: { ok: true; status: number; body: Record<string, unknown> } | { ok: false; status: number; error: string }) {
  if (!result.ok) return deny(res, result.status, result.error);
  return res.status(result.status).json(result.body);
}

async function run(res: Response, task: () => Promise<unknown>): Promise<void> {
  try {
    await task();
  } catch (error) {
    if (error instanceof PlatformAdminUnavailable) {
      deny(res, 503, error.message);
      return;
    }
    console.error('[tenant-profile]', error instanceof Error ? error.message : 'tenant profile write failed');
    deny(res, 500, 'تعذر تنفيذ العملية');
  }
}

export function registerTenantProfileRoutes(app: Express): void {
  app.post('/api/tenant/company-profile', async (req, res) => {
    const actor = sessionActor(req, res, companyProfileRoleAllowed);
    if (!actor) return;
    await run(res, async () => send(res, await mergeSessionCompanyProfile(actor, { patch: req.body?.patch ?? req.body })));
  });

  app.post('/api/tenant/system-integrations', async (req, res) => {
    const actor = sessionActor(req, res, companyAdminRole);
    if (!actor) return;
    await run(res, async () => send(res, await saveSessionIntegrations(actor, req.body || {})));
  });
}
