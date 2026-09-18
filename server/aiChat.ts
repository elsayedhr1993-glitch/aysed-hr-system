import type { Express, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { getChatModelCandidates } from '../src/config/aiConfig.ts';
import {
  buildCreateEmployeeActionFromPrompt,
  parseModelCopilotPayload,
  sanitizeCopilotAction,
} from '../src/lib/aiCopilotActions.ts';
import { assertClientCompanyAccess } from '../src/lib/aiCopilotContext.ts';
import { COPILOT_APP_IDS, COPILOT_FUNCTION_NAMES, COPILOT_MODAL_IDS } from '../src/lib/aiCopilotTypes.ts';

type AuthDeps = {
  requireFirebaseAuth: (req: Request, res?: Response) => Promise<any>;
  resolveCallerRole: (authCheck: {
    uid: string;
    email?: string;
    claims?: Record<string, unknown>;
  }) => Promise<{ role: string; companyId?: string }>;
  getGeminiClient: () => GoogleGenAI | null;
};

const COPILOT_SYSTEM = `أنت مساعد Aysed S HR 2026 للموارد البشرية في الكويت.
- أجب بالعربية المهنية مع Markdown عند الحاجة.
- استشارات قانون العمل 6/2010، الإجازات، EOS، الرواتب بـ KWD (ثلاث خانات).
- لا تختلق أسماء موظفين أو أرقاماً من السياق؛ السياق إحصائي فقط.

عند طلب تنفيذ داخل النظام، أخرج JSON فقط بالشكل:
{"reply":"نص للمستخدم","action":{...} أو null}

action.type المسموح:
- NAVIGATE + appId من: ${COPILOT_APP_IDS.join(', ')}
- OPEN_MODAL + modal من: ${COPILOT_MODAL_IDS.join(', ')}
- TRIGGER_FUNCTION + functionName من: ${COPILOT_FUNCTION_NAMES.join(', ')}
- OPEN_CALCULATOR (حاسبة HR سريعة)
- CREATE_EMPLOYEE + employeeData (nameAr, civilId, jobTitle, department, basicSalary, ...)

إذا كان السؤال استشارة فقط، action = null.
لا تُرجع نصاً خارج JSON.`;

export function registerAiChatRoute(app: Express, deps: AuthDeps) {
  app.post('/api/ai-chat', async (req: Request, res: Response) => {
    try {
      const authCheck = await deps.requireFirebaseAuth(req, res);
      if (!authCheck.ok) {
        return res.status(authCheck.status || 401).json({ success: false, error: authCheck.error });
      }

      const { prompt, contextSummary, conversationHistory, companyId: bodyCompanyId } = req.body || {};
      if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({
          success: false,
          error: 'الرجاء كتابة السؤال أو الطلب للمساعد الذكي',
          code: 'VALIDATION_ERROR',
        });
      }

      const resolved = await deps.resolveCallerRole(authCheck as any);
      const isSuperAdmin = resolved.role === 'SUPER_ADMIN';
      const access = assertClientCompanyAccess(
        bodyCompanyId ? String(bodyCompanyId) : resolved.companyId,
        resolved.companyId,
        isSuperAdmin
      );
      if (!access.ok) {
        const denied = access as { ok: false; reason: string };
        return res.status(403).json({
          success: false,
          error: denied.reason,
          code: 'COMPANY_MISMATCH',
        });
      }

      const regexAction = buildCreateEmployeeActionFromPrompt(String(prompt));
      const ai = deps.getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'محرك الذكاء الاصطناعي غير مهيأ على الخادم (GEMINI_API_KEY).',
          code: 'AI_NOT_CONFIGURED',
          action: regexAction,
        });
      }

      const parts: { text: string }[] = [];
      parts.push({
        text: `[سياق الشركة — بيانات مجمّعة فقط]\n${contextSummary || 'لا يوجد سياق إضافي.'}\ncompanyId=${access.companyId}`,
      });

      if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory.slice(-12)) {
          parts.push({
            text: `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${String(msg.content || '').slice(0, 4000)}`,
          });
        }
      }
      parts.push({ text: `سؤال المستخدم: ${String(prompt).trim()}` });

      const models = getChatModelCandidates();
      let lastErr: unknown = null;

      for (const modelName of models) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction: COPILOT_SYSTEM,
              temperature: 0.35,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: { type: Type.STRING },
                  action: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      appId: { type: Type.STRING },
                      modal: { type: Type.STRING },
                      functionName: { type: Type.STRING },
                      employeeData: { type: Type.OBJECT },
                    },
                  },
                },
                required: ['reply'],
              },
            },
          });

          const rawText = response.text || '{}';
          const { reply, action: parsedAction } = parseModelCopilotPayload(rawText);
          const action = parsedAction || regexAction;

          return res.json({
            success: true,
            reply: reply || 'تمت المعالجة.',
            source: `gemini:${modelName}`,
            action: action ? sanitizeCopilotAction(action) : null,
          });
        } catch (err) {
          lastErr = err;
          console.warn(`[ai-chat] model ${modelName} failed:`, err);
        }
      }

      console.error('[ai-chat] all models failed', lastErr);
      return res.status(503).json({
        success: false,
        error: 'تعذر الاتصال بمحرك الذكاء الاصطناعي. تحقق من الرصيد وأسماء النماذج.',
        code: 'AI_UNAVAILABLE',
        action: regexAction,
      });
    } catch (error: any) {
      console.error('[ai-chat] unexpected', error);
      return res.status(500).json({
        success: false,
        error: error?.message || 'خطأ داخلي في مساعد الذكاء الاصطناعي',
        code: 'AI_UNAVAILABLE',
      });
    }
  });
}
