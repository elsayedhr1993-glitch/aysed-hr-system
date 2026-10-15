import type { Express, Request, Response } from 'express';
import {
  isAuditAction,
  listAuditEvents,
  recordAuditEvent,
  requestIp,
  type AuditAction,
} from './auditLog';

const READ_ROLES = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER']);

function readFilters(req: Request) {
  const tenant = req.sessionTenant;
  return {
    viewerRole: tenant?.role || 'UNKNOWN',
    sessionCompanyId: tenant?.companyId,
    q: String(req.query.q || req.body?.q || ''),
    user: String(req.query.user || req.body?.user || ''),
    action: String(req.query.action || req.body?.action || ''),
    entity: String(req.query.entity || req.body?.entity || ''),
    from: String(req.query.from || req.body?.from || ''),
    to: String(req.query.to || req.body?.to || ''),
    page: Number(req.query.page || req.body?.page || 1),
    pageSize: Number(req.query.pageSize || req.body?.pageSize || 10),
  };
}

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

export function registerAuditRoutes(app: Express): void {
  app.post('/api/audit/events', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!tenant.role || tenant.role === 'UNKNOWN') return deny(res, 403, 'Unauthorized');
    const action = req.body?.action;
    if (!isAuditAction(action) || action === 'device_rejected') {
      return deny(res, 400, 'إجراء غير مدعوم');
    }
    const event = recordAuditEvent({
      actor: {
        uid: tenant.uid,
        name: String(req.body?.userName || tenant.email || tenant.uid),
        role: tenant.role,
      },
      action: action as AuditAction,
      entityType: String(req.body?.entityType || 'record'),
      entityId: String(req.body?.entityId || ''),
      before: req.body?.before,
      after: req.body?.after,
      ip: requestIp(req),
      sessionCompanyId: tenant.companyId,
    });
    return res.json({ success: true, id: event.id });
  });

  app.get('/api/audit/events', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!READ_ROLES.has(tenant.role)) return deny(res, 403, 'غير مخول لعرض سجل الرقابة');
    const page = listAuditEvents(readFilters(req));
    return res.json({ success: true, ...page });
  });

  app.post('/api/audit/export', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!READ_ROLES.has(tenant.role)) return deny(res, 403, 'غير مخول لتصدير سجل الرقابة');
    recordAuditEvent({
      actor: { uid: tenant.uid, name: tenant.email || tenant.uid, role: tenant.role },
      action: 'export',
      entityType: 'audit_log',
      entityId: 'audit_log',
      after: { exported: true },
      ip: requestIp(req),
      sessionCompanyId: tenant.role === 'SUPER_ADMIN' ? '' : tenant.companyId,
    });
    const page = listAuditEvents({ ...readFilters(req), page: 1, pageSize: 50 });
    return res.json({ success: true, ...page });
  });
}
