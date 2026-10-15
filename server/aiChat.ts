import type { Express, Request, Response } from 'express';
import { requestIp } from './auditLog';
import { handleAiChatRequest } from './aiChatCore';
import type { GeminiClient } from './geminiServer';

type AuthDeps = {
  requireFirebaseAuth: (req: Request, res?: Response) => Promise<any>;
  resolveCallerRole: (authCheck: {
    uid: string;
    email?: string;
    claims?: Record<string, unknown>;
  }) => Promise<{ role: string; companyId?: string }>;
  getGeminiClient: () => GeminiClient | null;
};

export function registerAiChatRoute(app: Express, deps: AuthDeps) {
  const onChat = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const result = await handleAiChatRequest(
      req.body,
      authHeader as string | undefined,
      deps.getGeminiClient,
      { ip: requestIp(req) }
    );
    return res.status(result.status).json(result.body);
  };
  app.post('/api/chat', onChat);
  app.post('/api/ai-chat', onChat);
}
