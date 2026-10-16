import type { Express, Response } from 'express';
import { requestIp } from './auditLog';
import { currentImpersonation } from './impersonationStore';
import { resetStudioOverride, saveStudioOverrides } from './studioOverrides';

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

export function registerStudioRoutes(app: Express): void {
  app.put('/api/studio/overrides', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    const impersonation = currentImpersonation(tenant.uid);
    const result = await saveStudioOverrides({
      role: tenant.role,
      uid: tenant.uid,
      email: tenant.email,
      sessionCompanyId: tenant.companyId,
      impersonatedCompanyId: impersonation?.companyId,
      patches: req.body?.patches,
      ip: requestIp(req),
    });
    return res.status(result.status).json(result.body);
  });

  app.post('/api/studio/overrides/reset', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    const impersonation = currentImpersonation(tenant.uid);
    const result = await resetStudioOverride({
      role: tenant.role,
      uid: tenant.uid,
      email: tenant.email,
      sessionCompanyId: tenant.companyId,
      impersonatedCompanyId: impersonation?.companyId,
      key: req.body?.key,
      ip: requestIp(req),
    });
    return res.status(result.status).json(result.body);
  });
}
