function readConfigEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return String(process.env[key]);
  }
  const viteEnv = import.meta.env as Record<string, string | undefined>;
  return viteEnv[key] ?? viteEnv[`VITE_${key}`];
}

export const AI_MODELS = {
  chat: readConfigEnv('AI_CHAT_MODEL') || 'gemini-2.5-flash',
  ocr: readConfigEnv('AI_OCR_MODEL') || 'gemini-2.5-flash',
  fallback: readConfigEnv('AI_FALLBACK_MODEL') || 'gemini-2.5-pro',
} as const;

function uniqueModels(candidates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const m = String(raw || '').trim();
    if (!m || seen.has(m)) continue;
    seen.add(m);
    out.push(m);
  }
  return out;
}

/** Chat / copilot model rotation (newest first). */
export function getChatModelCandidates(): string[] {
  const extra = (readConfigEnv('AI_CHAT_MODEL_FALLBACKS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return uniqueModels([
    AI_MODELS.chat,
    ...extra,
    'gemini-2.0-flash',
    AI_MODELS.fallback,
  ]);
}

/** Vision OCR model rotation. */
export function getOcrModelCandidates(): string[] {
  const extra = (readConfigEnv('AI_OCR_MODEL_FALLBACKS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return uniqueModels([AI_MODELS.ocr, ...extra, AI_MODELS.fallback, 'gemini-2.0-flash']);
}

/** Lightweight connectivity probe models. */
export function getConnectivityTestModels(): string[] {
  return uniqueModels([AI_MODELS.chat, AI_MODELS.fallback, 'gemini-2.0-flash']);
}

export interface AiConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  prompt: string;
  companyId?: string;
  contextSummary?: string;
  conversationHistory?: AiConversationTurn[];
}

export function buildAiPayload(input: {
  prompt: string;
  companyId?: string;
  contextSummary?: string;
  conversationHistory?: AiConversationTurn[];
}): AiChatRequest {
  return {
    prompt: String(input.prompt ?? '').trim(),
    ...(input.companyId ? { companyId: String(input.companyId) } : {}),
    ...(input.contextSummary ? { contextSummary: String(input.contextSummary) } : {}),
    ...(Array.isArray(input.conversationHistory) && input.conversationHistory.length > 0
      ? {
          conversationHistory: input.conversationHistory.map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: String(item.content ?? '').trim(),
          })),
        }
      : {}),
  };
}
