import { getAdminFirestore } from './firebaseAdmin';
import {
  classifyCopilotIntent,
  isToolIntent,
  type CopilotToolId,
} from '../src/lib/copilotIntentRouter';
import { runCopilotTool } from './copilot/toolRunner';
import { requireFirebaseAuthFromHeader, resolveCallerRole } from './apiAuth';
import { assertClientCompanyAccess } from '../src/lib/aiCopilotContext';
import { isSuperAdminPrincipal } from '../src/config/superAdminAccess';

export interface CopilotExecuteHttpResult {
  status: number;
  body: Record<string, unknown>;
}

function promptLooksArabic(prompt: string): boolean {
  return /[\u0600-\u06FF]/.test(prompt);
}

export async function handleCopilotExecuteRequest(
  body: Record<string, unknown> | null | undefined,
  authHeader: string | string[] | undefined
): Promise<CopilotExecuteHttpResult> {
  const authCheck = await requireFirebaseAuthFromHeader(authHeader);
  if (authCheck.ok === false) {
    return {
      status: authCheck.status,
      body: { success: false, error: authCheck.error, code: 'UNAUTHORIZED' },
    };
  }

  const toolId = String(body?.toolId || '').trim() as CopilotToolId;
  const promptText = String(body?.prompt || '').trim();
  const bodyCompanyId = String(body?.companyId || '').trim();
  const companyName = String(body?.companyName || '').trim() || undefined;

  const resolved = await resolveCallerRole(authCheck);
  const isSuperAdmin = isSuperAdminPrincipal({
    role: resolved.role,
    email: authCheck.email,
  });
  const access = assertClientCompanyAccess(
    bodyCompanyId || resolved.companyId,
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

  let resolvedToolId = toolId;
  if (!resolvedToolId && promptText) {
    const intent = classifyCopilotIntent(promptText, 'chat');
    if (isToolIntent(intent)) resolvedToolId = intent.toolId;
  }

  if (!resolvedToolId) {
    return {
      status: 400,
      body: { success: false, error: 'toolId أو prompt معرّف للأداة مطلوب', code: 'VALIDATION_ERROR' },
    };
  }

  const db = getAdminFirestore();
  if (!db) {
    return {
      status: 503,
      body: { success: false, error: 'Firebase Admin غير متاح', code: 'SERVER_UNAVAILABLE' },
    };
  }

  const isArabic = body?.isArabic === false ? false : promptLooksArabic(promptText) || body?.isArabic !== false;

  try {
    const result = await runCopilotTool(db, resolvedToolId, access.companyId, {
      isArabic,
      companyName,
    });
    return {
      status: 200,
      body: {
        success: true,
        reply: result.reply,
        source: `tool:${result.toolId}`,
        toolId: result.toolId,
        data: result.data,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل تنفيذ الأداة';
    return {
      status: 500,
      body: { success: false, error: message, code: 'TOOL_FAILED' },
    };
  }
}
