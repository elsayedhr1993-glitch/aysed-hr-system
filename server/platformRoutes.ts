import type { Express, Request, Response } from 'express';
import { platformOwnerFromRole } from '../src/pages/saasAccess';
import { requestIp } from './auditLog';
import {
  approveSubscriptionRequest,
  archiveSubscriptionRequest,
  createFacilityAdmin,
  createPlatformCompany,
  deleteCompliance,
  deleteSystemConfig,
  PlatformAdminUnavailable,
  purgePlatformTenant,
  readSystemKeys,
  resetPlatformUiOverride,
  restorePlatformBackup,
  saveCustomLayout,
  savePlatformSystemKeys,
  savePlatformUiOverrides,
  suspendSubscriptionRequest,
  listSubscriptionRequests,
  savePlatformPamForm,
  updateSubscriptionRequest,
  upsertFacilityUsers,
  type PlatformActor,
} from './platformOwnerWrites';

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function owner(req: Request, res: Response): PlatformActor | null {
  const tenant = req.sessionTenant;
  if (!tenant) {
    deny(res, 401, 'Unauthorized');
    return null;
  }
  if (!platformOwnerFromRole(tenant.role)) {
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
    console.error('[platform]', error instanceof Error ? error.message : 'platform write failed');
    deny(res, 500, 'تعذر تنفيذ العملية');
  }
}

export function registerPlatformRoutes(app: Express): void {
  app.post('/api/platform/companies', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await createPlatformCompany(actor, req.body || {})));
  });

  app.post('/api/platform/facility-admins', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await createFacilityAdmin(actor, req.body || {})));
  });

  app.post('/api/platform/subscription-requests/approve', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await approveSubscriptionRequest(actor, req.body || {})));
  });

  app.post('/api/platform/subscription-requests/suspend', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await suspendSubscriptionRequest(actor, req.body?.requestId)));
  });

  app.post('/api/platform/subscription-requests/archive', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await archiveSubscriptionRequest(actor, req.body?.requestId)));
  });

  app.post('/api/platform/subscription-requests/update', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await updateSubscriptionRequest(actor, req.body || {})));
  });

  app.get('/api/platform/subscription-requests', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await listSubscriptionRequests()));
  });

  app.post('/api/platform/facility-users', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await upsertFacilityUsers(actor, req.body || {})));
  });

  app.post('/api/platform/pam-form', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await savePlatformPamForm(actor, req.body || {})));
  });

  app.put('/api/platform/custom-layouts', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await saveCustomLayout(actor, req.body || {})));
  });

  app.put('/api/platform/ui-overrides', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => {
      const result = await savePlatformUiOverrides(actor, req.body || {});
      res.status(result.status).json(result.body);
    });
  });

  app.post('/api/platform/ui-overrides/reset', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => {
      const result = await resetPlatformUiOverride(actor, req.body || {});
      res.status(result.status).json(result.body);
    });
  });

  app.post('/api/platform/compliance/delete', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await deleteCompliance(actor, req.body || {})));
  });

  app.post('/api/platform/system-config/delete', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await deleteSystemConfig(actor, req.body || {})));
  });

  app.get('/api/platform/system-config/keys', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await readSystemKeys()));
  });

  app.post('/api/platform/system-config/keys', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await savePlatformSystemKeys(actor, req.body || {})));
  });

  app.post('/api/platform/backup/restore', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await restorePlatformBackup(actor, req.body || {})));
  });

  app.post('/api/platform/tenants/purge', async (req, res) => {
    const actor = owner(req, res);
    if (!actor) return;
    await run(res, async () => send(res, await purgePlatformTenant(actor, req.body || {})));
  });
}
