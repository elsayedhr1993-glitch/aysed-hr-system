import type { Express, Request, Response } from 'express';
import { handleCopilotExecuteRequest } from './copilotExecuteCore';

export function registerCopilotExecuteRoute(app: Express) {
  app.post('/api/copilot-execute', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const result = await handleCopilotExecuteRequest(req.body, authHeader as string | undefined);
    return res.status(result.status).json(result.body);
  });
}
