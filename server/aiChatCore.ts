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
import { getGeminiClient } from './geminiServer';

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
  ai: GoogleGenAI,
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

export async function handleAiChatRequest(
  body: Record<string, unknown> | null | undefined,
  authHeader: string | string[] | undefined,
  getClient: () => GoogleGenAI | null = getGeminiClient
): Promise<AiChatHttpResult> {
  try {
    const authCheck = await requireFirebaseAuthFromHeader(authHeader);
    if (authCheck.ok === false) {
      return {
        status: authCheck.status,
        body: { success: false, error: authCheck.error, code: 'UNAUTHORIZED' },
      };
    }

    const {
      prompt,
      contextSummary,
      conversationHistory,
      companyId: bodyCompanyId,
      activeApp,
      screen,
      screenSummary,
      mode: bodyMode,
      fieldKind,
      currentValue,
      maxLength,
      entityBundle,
      entityType,
      entityId,
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

    const resolved = await resolveCallerRole(authCheck);
    const isSuperAdmin = isSuperAdminPrincipal({
      role: resolved.role,
      email: authCheck.email,
    });
    const access = assertClientCompanyAccess(
      bodyCompanyId ? String(bodyCompanyId) : resolved.companyId,
      resolved.companyId,
      isSuperAdmin
    );
    if (!access.ok) {
      const denied = access as { ok: false; reason: string };
      return {
        status: 403,
        body: { success: false, error: denied.reason, code: 'COMPANY_MISMATCH' },
      };
    }

    const regexAction = mode === 'chat' ? buildCopilotActionFromPrompt(promptText) : null;
    const ai = getClient();

    if (!ai) {
      return {
        status: 503,
        body: {
          success: false,
          error: 'محرك الذكاء الاصطناعي غير مهيأ على الخادم (GEMINI_API_KEY).',
          code: 'AI_NOT_CONFIGURED',
          ...(mode === 'chat' ? { action: regexAction } : {}),
        },
      };
    }

    if (mode === 'generate') {
      const genParts: { text: string }[] = [];
      genParts.push({
        text: `[سياق مختصر]\ncompanyId=${access.companyId}\n${String(contextSummary || '').slice(0, 2500)}`,
      });
      if (activeApp || screenSummary) {
        genParts.push({
          text: `[شاشة]\nactiveApp=${String(activeApp || '')}\n${screenSummary ? String(screenSummary).slice(0, 800) : ''}`,
        });
      }
      const fieldHints: Record<string, string> = {
        admin_decision: 'صياغة قرار إداري رسمي (عربي مهني، مرجعية قانون العمل 6/2010 عند الحاجة).',
        employee_notice: 'إشعار أو مراسلة موجهة للموظف (واضحة، محترمة، بدون تهديد غير قانوني).',
        contract_clause: 'بند أو ملحق عقد عمل كويتي (صياغة قانونية مختصرة).',
        leave_reason: 'سبب طلب إجازة مهني ومختصر.',
        hr_notes: 'ملاحظة إدارية داخلية على ملف الموظف.',
      };
      const kind = String(fieldKind || 'general');
      const hint = fieldHints[kind] || 'نص عام لنظام موارد بشرية.';
      genParts.push({
        text: `نوع الحقل: ${kind}\nتوجيه الصياغة: ${hint}\nالحد الأقصى للأحرف: ${maxLength ? Number(maxLength) : 'غير محدد'}\nالنص الحالي في الحقل:\n${String(currentValue || '').slice(0, 2000) || '—'}\n\nتعليمات المستخدم:\n${promptText}`,
      });

      const genResult = await generateWithReplySchema(ai, GENERATE_SYSTEM, genParts, 0.4);
      if (!genResult) {
        return {
          status: 503,
          body: {
            success: false,
            error: 'تعذر الاتصال بمحرك الذكاء الاصطناعي. تحقق من الرصيد وأسماء النماذج.',
            code: 'AI_UNAVAILABLE',
          },
        };
      }

      let reply = genResult.reply;
      const cap = maxLength ? Number(maxLength) : 0;
      if (cap > 0 && reply.length > cap) {
        reply = `${reply.slice(0, cap)}…`;
      }

      return {
        status: 200,
        body: {
          success: true,
          reply,
          source: genResult.source,
        },
      };
    }

    if (mode === 'summarize') {
      const sumParts: { text: string }[] = [];
      sumParts.push({
        text: `[سجل للتلخيص — entityType=${String(entityType || 'entity')} entityId=${String(entityId || '')}]\n${String(entityBundle).slice(0, 12000)}`,
      });
      sumParts.push({
        text: `تعليمات التلخيص:\n${promptText || 'لخّص الحالة الإدارية بشكل مهني ومختصر.'}`,
      });

      const sumResult = await generateWithReplySchema(ai, SUMMARIZE_SYSTEM, sumParts, 0.3);
      if (!sumResult) {
        return {
          status: 503,
          body: {
            success: false,
            error: 'تعذر الاتصال بمحرك الذكاء الاصطناعي. تحقق من الرصيد وأسماء النماذج.',
            code: 'AI_UNAVAILABLE',
          },
        };
      }

      return {
        status: 200,
        body: {
          success: true,
          reply: sumResult.reply,
          source: sumResult.source,
        },
      };
    }

    const parts: { text: string }[] = [];
    const screenBlock =
      activeApp || screen || screenSummary
        ? `\n[سياق الشاشة]\nactiveApp=${String(activeApp || '')}\nscreen=${screen ? JSON.stringify(screen).slice(0, 2000) : '—'}\n${screenSummary ? `ملخص: ${String(screenSummary).slice(0, 1500)}` : ''}`
        : '';
    parts.push({
      text: `[سياق الشركة — بيانات مجمّعة فقط]\n${contextSummary || 'لا يوجد سياق إضافي.'}\ncompanyId=${access.companyId}${screenBlock}`,
    });

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-12)) {
        const role = (msg as { role?: string }).role;
        const content = (msg as { content?: string }).content;
        parts.push({
          text: `${role === 'user' ? 'المستخدم' : 'المساعد'}: ${String(content || '').slice(0, 4000)}`,
        });
      }
    }
    parts.push({ text: `سؤال المستخدم: ${promptText}` });

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
        const action = parsedAction || regexAction;

        return {
          status: 200,
          body: {
            success: true,
            reply: reply || 'تمت المعالجة.',
            source: `gemini:${modelName}`,
            action: action ? sanitizeCopilotAction(action) : null,
          },
        };
      } catch (err) {
        lastErr = err;
        console.warn(`[ai-chat] model ${modelName} failed:`, err);
      }
    }

    console.error('[ai-chat] all models failed', lastErr);

    if (regexAction) {
      const safe = sanitizeCopilotAction(regexAction);
      if (safe) {
        return {
          status: 200,
          body: {
            success: true,
            reply: safe.title || 'تم التعرف على طلبك. يمكنك تنفيذ الإجراء أدناه.',
            source: 'regex_action',
            action: safe,
          },
        };
      }
    }

    return {
      status: 503,
      body: {
        success: false,
        error: 'تعذر الاتصال بمحرك الذكاء الاصطناعي. تحقق من الرصيد وأسماء النماذج.',
        code: 'AI_UNAVAILABLE',
        action: regexAction ? sanitizeCopilotAction(regexAction) : null,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ داخلي في مساعد الذكاء الاصطناعي';
    console.error('[ai-chat] unexpected', error);
    return {
      status: 500,
      body: { success: false, error: message, code: 'AI_UNAVAILABLE' },
    };
  }
}
