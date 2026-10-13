import type { Express, Request, Response } from 'express';
import { handleLeaveApproveRequest } from './leaveApproveCore';

export function registerLeaveApproveRoute(app: Express) {
  app.post('/api/leave/approve', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const result = await handleLeaveApproveRequest(req.body, authHeader as string | undefined);
    return res.status(result.status).json(result.body);
  });
}
