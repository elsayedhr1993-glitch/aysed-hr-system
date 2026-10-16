import type { Express, Response } from 'express';
import { platformOwnerFromRole } from '../src/pages/saasAccess';
import { recordAuditEvent, requestIp } from './auditLog';
import {
  beginImpersonation,
  breakGlassImpersonation,
  currentImpersonation,
  endImpersonation,
} from './impersonationStore';

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function actor(req: { sessionTenant?: { uid?: string; email?: string; role?: string } }) {
  const tenant = req.sessionTenant;
  return { uid: tenant?.uid, name: tenant?.email, role: tenant?.role };
}

export function registerSaasRoutes(app: Express): void {
  app.get('/api/saas/access', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    return res.json({ success: true, platformOwner: platformOwnerFromRole(tenant.role) });
  });

  app.get('/api/admin/impersonate', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!platformOwnerFromRole(tenant.role)) return deny(res, 403, 'Unauthorized');
    const session = currentImpersonation(tenant.uid);
    return res.json({
      success: true,
      active: Boolean(session),
      readOnly: true,
      hideSensitive: Boolean(session && !session.breakGlass),
      companyId: session?.companyId || '',
      expiresAt: session?.expiresAt || 0,
      breakGlass: Boolean(session?.breakGlass),
    });
  });

  app.post('/api/admin/impersonate', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!platformOwnerFromRole(tenant.role)) return deny(res, 403, 'Unauthorized');
    const started = beginImpersonation(tenant.uid, String(req.body?.companyId || ''), String(req.body?.reason || ''));
    if (started.ok === false) return deny(res, 400, started.error);
    await recordAuditEvent({
      actor: actor(req),
      action: 'view_sensitive',
      entityType: 'impersonation',
      entityId: started.session.companyId,
      sessionCompanyId: tenant.companyId,
      ip: requestIp(req),
      details: 'دخول كمسؤول',
      after: { reason: started.session.reason, expiresAt: started.session.expiresAt },
    });
    return res.json({ success: true, expiresAt: started.session.expiresAt, readOnly: true });
  });

  app.post('/api/admin/impersonate/break-glass', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!platformOwnerFromRole(tenant.role)) return deny(res, 403, 'Unauthorized');
    const opened = breakGlassImpersonation(tenant.uid, String(req.body?.reason || ''));
    if (opened.ok === false) return deny(res, 400, opened.error);
    await recordAuditEvent({
      actor: actor(req),
      action: 'view_sensitive',
      entityType: 'impersonation_break_glass',
      entityId: opened.session.companyId,
      sessionCompanyId: tenant.companyId,
      ip: requestIp(req),
      details: 'break-glass',
      after: { reason: opened.session.breakGlassReason },
    });
    return res.json({ success: true, breakGlass: true });
  });

  app.post('/api/admin/impersonate/end', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    endImpersonation(tenant.uid);
    return res.json({ success: true });
  });
}
