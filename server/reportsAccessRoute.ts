import type { Express, Response } from 'express';
import { payrollReportsAllowed } from '../src/components/reports/reportsAccess';
import { currentImpersonation } from './impersonationStore';

function deny(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

/** Session role decides salary and end-of-service reports. No payroll numbers are returned. */
export function registerReportsAccessRoute(app: Express): void {
  app.get('/api/reports/access', (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return deny(res, 401, 'Unauthorized');
    if (!tenant.role || tenant.role === 'UNKNOWN') return deny(res, 403, 'Unauthorized');
    const impersonation = currentImpersonation(tenant.uid);
    const payroll =
      payrollReportsAllowed(tenant.role) && (!impersonation || impersonation.breakGlass);
    return res.json({
      success: true,
      payroll,
    });
  });
}
