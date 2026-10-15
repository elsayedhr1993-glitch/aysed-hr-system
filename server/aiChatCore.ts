import { GoogleGenAI, Type } from '@google/genai';
import { getChatModelCandidates } from './aiModelEnv';
import { isSuperAdminPrincipal } from '../src/config/superAdminAccess';
import {
  buildCopilotActionFromPrompt,
  parseModelCopilotPayload,
  sanitizeCopilotAction,
} from '../src/lib/aiCopilotActions';
import { assertClientCompanyAccess } from '../src/lib/aiCopilotContext';
import { COPILOT_APP_IDS, COPILOT_FUNCTION_NAMES, COPILOT_MODAL_IDS } from '../src/lib/aiCopilotTypes';
import { requireFirebaseAuthFromHeader, resolveCallerRole } from './apiAuth';
import { recordAuditEvent } from './auditLog';
import { getGeminiClient, type GeminiClient } from './geminiServer';
import {
  assertChatSession,
  buildChatModelParts,
  buildGenerateModelText,
  buildSummarizeModelText,
  redactModelText,
} from './aiOutbound';
import {
  parseEmployeeStatsFromContextSummary,
  tryLocalFaqAnswer,
} from '../src/lib/copilotLocalFaq';
import { classifyCopilotIntent, isToolIntent } from '../src/lib/copilotIntentRouter';
import { buildLocalDashboardFallbackReply } from '../src/lib/copilotLocalDashboardFallback';
import { getAdminFirestore } from './firebaseAdmin';
import { runCopilotTool } from './copilot/toolRunner';

const COPILOT_SYSTEM = `أنت مساعد Aysed S HR 2026 للموارد البشرية في الكويت.
- أجب بالعربية المهنية مع Markdown عند الحاجة.
- استشارات قانون العمل 6/2010، الإجازات، EOS، الرواتب بـ KWD (ثلاث خانات).
- لا تختلق أسماء موظفين أو أرقاماً من السياق؛ السياق إحصائي فقط.

عند طلب تنفيذ داخل النظام، أخرج JSON فقط بالشكل:
{"reply":"نص للمستخدم","action":{...} أو null}

action.type المسموح:
- NAVIGATE + appId من: ${COPILOT_APP_IDS.join(', ')} (معرّف الإجازات هو leaves وليس timeoff)
  + appTab اختياري داخل التطبيق: finance | requests | allocations | timeline | operational_absence
- OPEN_MODAL + modal من: ${COPILOT_MODAL_IDS.join(', ')}
- TRIGGER_FUNCTION + functionName من: ${COPILOT_FUNCTION_NAMES.join(', ')}
- OPEN_CALCULATOR (حاسبة HR سريعة)
- CREATE_EMPLOYEE + employeeData (nameAr, civilId, jobTitle, department, basicSalary, ...)
- CREATE_LEAVE_DRAFT + leaveDraft (employeeId أو civilId أو employeeName، startDate، endDate، leaveType، reason، submitForApproval اختياري)

أمثلة إجراءات (يجب إرجاع action وليس نصاً فقط):
- «افتح تطبيق الإجازات والمركز المالي» → {"reply":"سأفتح المركز المالي في تطبيق الإجازات.","action":{"type":"NAVIGATE","appId":"leaves","appTab":"finance","title":"فتح المركز المالي"}}
- «افتح حاسبة الموارد البشرية» → {"reply":"…","action":{"type":"OPEN_CALCULATOR","title":"فتح الحاسبة السريعة"}}

إذا كان المستخدم داخل تطبيق الإجازات (activeApp=leaves)، فضّل إجراءات وإجابات متعلقة بالإجازات والأرصدة.
إذا كان السؤال استشارة فقط، action = null.
لا تُرجع نصاً خارج JSON.`;

const GENERATE_SYSTEM = `أنت مساعد صياغة نصوص لنظام موارد بشرية كويتي (Aysed HR).
- أخرج JSON فقط: {"reply":"النص النهائي"}
- لا action ولا markdown معقد؛ نص جاهز للحقل مباشرة.
- عربية مهنية، قانون العمل الكويتي عند الحاجة، KWD للرواتب.
- احترم حد الطول إن وُجد.
- لا تختلق أسماء موظفين أو أرقاماً مدنية من السياق.`;

const SUMMARIZE_SYSTEM = `أنت محلل موارد بشرية لملخصات إدارية داخلية في الكويت.
- أخرج JSON فقط: {"reply":"الملخص"}
- ملخص عربي مهني: نقاط مرقمة، وضوح، بدون اختلاق بيانات غير موجودة في الحزمة.
- لا action ولا نص خارج JSON.`;

function normalizeAssistMode(raw: unknown): 'chat' | 'generate' | 'summarize' {
  const m = String(raw || 'chat').trim();
  if (m === 'generate' || m === 'summarize') return m;
  return 'chat';
}

async function generateWithReplySchema(
  ai: GeminiClient,
  systemInstruction: string,
  parts: { text: string }[],
  temperature = 0.35
): Promise<{ reply: string; source: string } | null> {
  const models = getChatModelCandidates();
  let lastErr: unknown = null;

  for (const modelName of models) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction,
          temperature,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
            },
            required: ['reply'],
          },
        },
      });

      const rawText = response.text || '{}';
      const { reply } = parseModelCopilotPayload(rawText);
      return {
        reply: reply || rawText.trim(),
        source: `gemini:${modelName}`,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`[ai-chat] model ${modelName} failed:`, err);
    }
  }

  console.error('[ai-chat] all models failed', lastErr);
  return null;
}

export interface AiChatHttpResult {
  status: number;
  body: Record<string, unknown>;
}

function localActionSuccessBody(action: ReturnType<typeof sanitizeCopilotAction>): AiChatHttpResult | null {
  if (!action) return null;
  return {
    status: 200,
    body: {
      success: true,
      reply: action.title || 'تم التعرف على طلبك. يمكنك تنفيذ الإجراء أدناه.',
      source: 'regex_action',
      action,
    },
  };
}

function resolveSafeLocalAction(mode: string, promptText: string) {
  if (mode !== 'chat' || !promptText) return null;
  const regexAction = buildCopilotActionFromPrompt(promptText);
  return regexAction ? sanitizeCopilotAction(regexAction) : null;
}

function promptLooksArabic(promptText: string): boolean {
  return /[\u0600-\u06FF]/.test(promptText);
}

function companyNameFromContextSummary(contextSummary: unknown): string | undefined {
  const ctx = String(contextSummary || '');
  const m = ctx.match(/الاسم:\s*(.+)/);
  return m ? m[1].trim() : undefined;
}

async function copilotToolSuccessBody(
  promptText: string,
  companyId: string,
  contextSummary: unknown,
  role: string
): Promise<AiChatHttpResult | null> {
  const intent = classifyCopilotIntent(promptText, 'chat');
  if (!isToolIntent(intent)) return null;

  const toolId = intent.toolId;
  const db = getAdminFirestore();
  if (!db) {
    console.error('[ai-chat] copilot tool failed: Firebase Admin Firestore unavailable', {
      toolId,
      companyId,
      hint: 'Check FIREBASE_SERVICE_ACCOUNT or FIREBASE_CLIENT_EMAIL/PRIVATE_KEY in .env',
    });
    return {
      status: 503,
      body: {
        success: false,
        error: 'قاعدة البيانات الإدارية غير مهيأة على الخادم (Firebase Admin).',
        code: 'TOOL_FIRESTORE_UNAVAILABLE',
        toolId,
      },
    };
  }

  try {
    const result = await runCopilotTool(db, toolId, companyId, {
      isArabic: promptLooksArabic(promptText),
      companyName: companyNameFromContextSummary(contextSummary),
      complianceFilters: intent.tier === 'L2' ? intent.toolContext : undefined,
    });
    return {
      status: 200,
      body: {
        success: true,
        reply: redactModelText(result.reply, role),
        source: `tool:${result.toolId}`,
        toolId: result.toolId,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-chat] copilot tool failed', {
      toolId,
      companyId,
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      status: 503,
      body: {
        success: false,
        error: 'تعذر تنفيذ الطلب الآن. أعد المحاولة بعد قليل.',
        code: 'TOOL_FAILED',
        toolId,
      },
    };
  }
}

async function localDashboardFallbackBody(
  promptText: string,
  companyId: string,
  contextSummary: unknown
): Promise<AiChatHttpResult | null> {
  const isArabic = promptLooksArabic(promptText);
  const db = getAdminFirestore();
  const reply = await buildLocalDashboardFallbackReply({
    promptText,
    contextSummary,
    isArabic,
    fetchEmployeeStats: async () => {
      if (!db) return null;
      try {
        const r = await runCopilotTool(db, 'tenant.employeeStats', companyId, {
          isArabic,
          companyName: companyNameFromContextSummary(contextSummary),
        });
        return { reply: r.reply };
      } catch {
        return null;
      }
    },
    fetchComplianceGaps: async (filters) => {
      if (!db) return null;
      try {
        const r = await runCopilotTool(db, 'compliance.documentGaps', companyId, {
          isArabic,
          complianceFilters: filters,
        });
        return { reply: r.reply };
      } catch {
        return null;
      }
    },
  });
  if (!reply) return null;
  return {
    status: 200,
    body: { success: true, reply, source: 'local_dashboard_fallback' },
  };
}

function localFaqSuccessBody(
  promptText: string,
  contextSummary: unknown
): AiChatHttpResult | null {
  const stats = parseEmployeeStatsFromContextSummary(String(contextSummary || ''));
  const reply = tryLocalFaqAnswer(promptText, stats, promptLooksArabic(promptText));
  if (!reply) return null;
  return {
    status: 200,
    body: { success: true, reply, source: 'local_faq' },
  };
}

export type AiChatRuntime = {
  requireAuth?: typeof requireFirebaseAuthFromHeader;
  resolveRole?: typeof resolveCallerRole;
  ip?: string;
};

function sealReply(result: AiChatHttpResult, role: string): AiChatHttpResult {
  const reply = result.body.reply;
  if (typeof reply !== 'string' || !reply) return result;
  return { ...result, body: { ...result.body, reply: redactModelText(reply, role) } };
}

export async function handleAiChatRequest(
  body: Record<string, unknown> | null | undefined,
  authHeader: string | string[] | undefined,
  getClient: () => GeminiClient | null = getGeminiClient,
  runtime: AiChatRuntime = {}
): Promise<AiChatHttpResult> {
  try {
    const requireAuth = runtime.requireAuth || requireFirebaseAuthFromHeader;
    const authCheck = await requireAuth(authHeader);
    if (authCheck.ok === false) {
      console.error('[ai-chat] auth rejected', { status: authCheck.status, detail: authCheck.error });
      const unavailable = authCheck.status >= 500;
      return {
        status: authCheck.status,
        body: {
          success: false,
          error: unavailable
            ? 'المساعد غير جاهز حالياً. أعد المحاولة بعد قليل.'
            : 'يلزم تسجيل الدخول قبل استخدام المساعد.',
          code: unavailable ? 'AI_UNAVAILABLE' : 'UNAUTHORIZED',
        },
      };
    }

    const {
      prompt,
      contextSummary,
      conversationHistory,
      companyId: bodyCompanyId,
      activeApp,
      screenSummary,
      mode: bodyMode,
      fieldKind,
      currentValue,
      maxLength,
      entityBundle,
      entityType,
    } = body || {};

    const mode = normalizeAssistMode(bodyMode);
    const promptText = String(prompt || '').trim();

    if (mode === 'summarize') {
      if (!entityBundle || !String(entityBundle).trim()) {
        return {
          status: 400,
          body: {
            success: false,
            error: 'لا توجد بيانات كافية لتلخيص السجل.',
            code: 'VALIDATION_ERROR',
          },
        };
      }
    } else if (!promptText) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'الرجاء كتابة السؤال أو الطلب للمساعد الذكي',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const resolveRole = runtime.resolveRole || resolveCallerRole;
    const resolved = await resolveRole(authCheck);
    const isSuperAdmin = isSuperAdminPrincipal({
      role: resolved.role,
      email: authCheck.email,
    });
    const session = assertChatSession({
      uid: authCheck.uid,
      role: resolved.role,
      companyId: resolved.companyId,
    });
    if (session.ok === false) {
      console.error('[ai-chat] session rejected', {
        code: session.code,
        uid: authCheck.uid,
        role: resolved.role || '',
      });
      return {
        status: session.status,
        body: { success: false, error: session.error, code: session.code },
      };
    }
    const access = assertClientCompanyAccess(
      bodyCompanyId ? String(bodyCompanyId) : session.companyId,
      session.companyId,
      isSuperAdmin
    );
    if (!access.ok) {
      const denied = access as { ok: false; reason: string };
      console.error('[ai-chat] company rejected', {
        sessionCompanyId: session.companyId,
        bodyCompanyId: bodyCompanyId ? String(bodyCompanyId) : '',
      });
      return {
        status: 403,
        body: { success: false, error: denied.reason, code: 'COMPANY_MISMATCH' },
      };
    }

    await recordAuditEvent({
      actor: { uid: session.uid, name: authCheck.email, role: session.role },
      action: 'ai_query',
      entityType: 'ai_chat',
      entityId: mode,
      ip: runtime.ip,
      sessionCompanyId: access.companyId,
      details: redactModelText(promptText || 'تلخيص سجل', 'EMPLOYEE'),
    });

    const safeRegexAction = resolveSafeLocalAction(mode, promptText);

    if (mode === 'chat' && promptText) {
      const toolBody = await copilotToolSuccessBody(
        promptText,
        access.companyId,
        contextSummary,
        session.role
      );
      if (toolBody) return sealReply(toolBody, session.role);
    }

    const ai = getClient();

    if (!ai) {
      const localOnly = localActionSuccessBody(safeRegexAction);
      if (localOnly) return sealReply(localOnly, session.role);
      const faqOnly = localFaqSuccessBody(promptText, contextSummary);
      if (faqOnly) return sealReply(faqOnly, session.role);
      if (mode === 'chat') {
        const dashboard = await localDashboardFallbackBody(promptText, access.companyId, contextSummary);
        if (dashboard) return sealReply(dashboard, session.role);
      }
      console.error('[ai-chat] model client missing');
      return {
        status: 503,
        body: {
          success: false,
          error: 'المساعد غير جاهز حالياً. راجع مسؤول النظام.',
          code: 'AI_NOT_CONFIGURED',
        },
      };
    }

    if (mode === 'generate') {
      const fieldHints: Record<string, string> = {
        admin_decision: 'صياغة قرار إداري رسمي (عربي مهني، مرجعية قانون العمل 6/2010 عند الحاجة).',
        employee_notice: 'إشعار أو مراسلة موجهة للموظف (واضحة، محترمة، بدون تهديد غير قانوني).',
        contract_clause: 'بند أو ملحق عقد عمل كويتي (صياغة قانونية مختصرة).',
        leave_reason: 'سبب طلب إجازة مهني ومختصر.',
        hr_notes: 'ملاحظة إدارية داخلية على ملف الموظف.',
      };
      const kind = String(fieldKind || 'general');
      const hint = fieldHints[kind] || 'نص عام لنظام موارد بشرية.';
      const genParts: { text: string }[] = [
        {
          text: buildGenerateModelText({
            role: session.role,
            prompt: promptText,
            contextSummary,
            activeApp,
            screenSummary,
            fieldKind: kind,
            fieldHint: hint,
            currentValue,
            maxLength,
          }),
        },
      ];

      const genResult = await generateWithReplySchema(ai, GENERATE_SYSTEM, genParts, 0.4);
      if (!genResult) {
        console.error('[ai-chat] generate failed');
        return {
          status: 503,
          body: {
            success: false,
            error: 'تعذر إكمال الطلب الآن. أعد المحاولة بعد قليل.',
            code: 'AI_UNAVAILABLE',
          },
        };
      }

      let reply = genResult.reply;
      const cap = maxLength ? Number(maxLength) : 0;
      if (cap > 0 && reply.length > cap) {
        reply = `${reply.slice(0, cap)}…`;
      }

      return sealReply(
        {
          status: 200,
          body: {
            success: true,
            reply,
            source: genResult.source,
          },
        },
        session.role
      );
    }

    if (mode === 'summarize') {
      const sumParts: { text: string }[] = [
        {
          text: buildSummarizeModelText({
            role: session.role,
            prompt: promptText,
            entityType,
            entityBundle,
          }),
        },
      ];

      const sumResult = await generateWithReplySchema(ai, SUMMARIZE_SYSTEM, sumParts, 0.3);
      if (!sumResult) {
        console.error('[ai-chat] summarize failed');
        return {
          status: 503,
          body: {
            success: false,
            error: 'تعذر إكمال الطلب الآن. أعد المحاولة بعد قليل.',
            code: 'AI_UNAVAILABLE',
          },
        };
      }

      return sealReply(
        {
          status: 200,
          body: {
            success: true,
            reply: sumResult.reply,
            source: sumResult.source,
          },
        },
        session.role
      );
    }

    const parts = buildChatModelParts({
      role: session.role,
      prompt: promptText,
      contextSummary,
      activeApp,
      screenSummary,
      conversationHistory,
    });

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
                    appTab: { type: Type.STRING },
                    modal: { type: Type.STRING },
                    functionName: { type: Type.STRING },
                    employeeData: { type: Type.OBJECT },
                    leaveDraft: { type: Type.OBJECT },
                  },
                },
              },
              required: ['reply'],
            },
          },
        });

        const rawText = response.text || '{}';
        const { reply, action: parsedAction } = parseModelCopilotPayload(rawText);
        const action = parsedAction || safeRegexAction;

        return sealReply(
          {
            status: 200,
            body: {
              success: true,
              reply: reply || 'تمت المعالجة.',
              source: `gemini:${modelName}`,
              action: action ? sanitizeCopilotAction(action) : null,
            },
          },
          session.role
        );
      } catch (err) {
        lastErr = err;
        console.warn(`[ai-chat] model ${modelName} failed:`, err);
      }
    }

    console.error('[ai-chat] all models failed', lastErr);

    const localAfterModelFail = localActionSuccessBody(safeRegexAction);
    if (localAfterModelFail) return sealReply(localAfterModelFail, session.role);

    const faqAfterModelFail = localFaqSuccessBody(promptText, contextSummary);
    if (faqAfterModelFail) return sealReply(faqAfterModelFail, session.role);

    const dashboardAfterFail = await localDashboardFallbackBody(
      promptText,
      access.companyId,
      contextSummary
    );
    if (dashboardAfterFail) return sealReply(dashboardAfterFail, session.role);

    return {
      status: 200,
      body: {
        success: true,
        reply: promptLooksArabic(promptText)
          ? 'تعذر الاتصال بمحرك الذكاء الاصطناعي الخارجي. جرّب: «كم موظف عندي»، «هل يوجد نواقص في ملفات الموظفين»، أو أوامر فتح الشاشات.'
          : 'External AI is unavailable. Try employee stats, compliance gap scan, or navigation commands.',
        source: 'local_dashboard_fallback',
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ داخلي في مساعد الذكاء الاصطناعي';
    console.error('[ai-chat] unexpected', error);
    const promptText = String((body && body.prompt) || '').trim();
    const mode = normalizeAssistMode(body?.mode);
    const localCatch = localActionSuccessBody(resolveSafeLocalAction(mode, promptText));
    if (localCatch) return localCatch;
    const faqCatch = localFaqSuccessBody(promptText, body?.contextSummary);
    if (faqCatch) return faqCatch;
    if (mode === 'chat') {
      return {
        status: 200,
        body: {
          success: true,
          reply: promptLooksArabic(promptText)
            ? 'تعذر إكمال الطلب بدون منشأة مرتبطة بالجلسة.'
            : 'The request could not be completed without a company on the session.',
          source: 'session_scope',
        },
      };
    }
    return {
      status: 200,
      body: {
        success: true,
        reply: promptLooksArabic(promptText)
          ? 'حدث خطأ داخلي مؤقت. استخدم أوامر الإحصاء والامتثال المحلية أو أعد المحاولة لاحقاً.'
          : 'A temporary error occurred. Use local stats/compliance commands or retry later.',
        source: 'local_dashboard_fallback',
      },
    };
  }
}
