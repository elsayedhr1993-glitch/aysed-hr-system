import type { Express, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { handleAiChatRequest } from './aiChatCore.ts';

type AuthDeps = {
  requireFirebaseAuth: (req: Request, res?: Response) => Promise<any>;
  resolveCallerRole: (authCheck: {
    uid: string;
    email?: string;
    claims?: Record<string, unknown>;
  }) => Promise<{ role: string; companyId?: string }>;
  getGeminiClient: () => GoogleGenAI | null;
};

export function registerAiChatRoute(app: Express, deps: AuthDeps) {
  app.post('/api/ai-chat', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const result = await handleAiChatRequest(req.body, authHeader as string | undefined, deps.getGeminiClient);
    return res.status(result.status).json(result.body);
  });
}
