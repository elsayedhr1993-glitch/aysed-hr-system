/** Default Gemini model when AI_* env vars are unset (chat + OCR). */
export const DEFAULT_CHAT_MODEL = 'gemini-2.5-flash';

/** Vision / document OCR default (same as chat unless AI_OCR_MODEL is set). */
export const DEFAULT_OCR_MODEL = 'gemini-2.5-flash';

/** Built-in OCR fallbacks when env lists are empty (vision-capable, current API). */
export const OCR_BUILTIN_FALLBACKS = ['gemini-2.5-pro', 'gemini-3.8-flash'] as const;

/** Models removed from Google API — never use for Vision/OCR even if listed in .env */
const RETIRED_VISION_MODEL_RE =
  /^gemini-(?:1\.5|2\.0)(?:-|$)/i;

export function isRetiredVisionModel(model: string): boolean {
  return RETIRED_VISION_MODEL_RE.test(String(model || '').trim());
}

function readConfigEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const direct = process.env[key];
    if (direct) {
      const v = String(direct).trim();
      if (v) return v;
    }
    // Do not map VITE_* into AI_* — avoids stale client build vars on the server.
    if (!key.startsWith('AI_')) {
      const mirrored = process.env[`VITE_${key}`];
      if (mirrored) {
        const v = String(mirrored).trim();
        if (v) return v;
      }
    }
  }
  const viteEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined> | undefined)
      : undefined;
  if (!viteEnv) return undefined;
  if (key.startsWith('AI_')) {
    return viteEnv[key]?.trim() || undefined;
  }
  return viteEnv[key] ?? viteEnv[`VITE_${key}`];
}

export function getPrimaryChatModel(): string {
  return readConfigEnv('AI_CHAT_MODEL') || DEFAULT_CHAT_MODEL;
}

export const AI_MODELS = {
  get chat() {
    return getPrimaryChatModel();
  },
  get ocr() {
    return readConfigEnv('AI_OCR_MODEL') || DEFAULT_OCR_MODEL;
  },
  get fallback() {
    return readConfigEnv('AI_FALLBACK_MODEL') || DEFAULT_OCR_MODEL;
  },
} as const;

function uniqueModels(candidates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const m = String(raw || '').trim();
    if (!m || seen.has(m) || isRetiredVisionModel(m)) continue;
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
  return uniqueModels([getPrimaryChatModel(), ...extra, DEFAULT_CHAT_MODEL, AI_MODELS.fallback]);
}

/** Vision OCR model rotation. */
export function getOcrModelCandidates(): string[] {
  const extra = (readConfigEnv('AI_OCR_MODEL_FALLBACKS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const primaryChat = getPrimaryChatModel();
  return uniqueModels([
    AI_MODELS.ocr,
    ...extra,
    DEFAULT_OCR_MODEL,
    ...OCR_BUILTIN_FALLBACKS,
    primaryChat !== AI_MODELS.ocr ? primaryChat : '',
    AI_MODELS.fallback,
  ]);
}

/** Lightweight connectivity probe models. */
export function getConnectivityTestModels(): string[] {
  return uniqueModels([getPrimaryChatModel(), DEFAULT_CHAT_MODEL, AI_MODELS.fallback]);
}

export interface AiConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  prompt: string;
  companyId?: string;
  contextSummary?: string;
  activeApp?: string;
  screen?: Record<string, unknown> | null;
  screenSummary?: string;
  conversationHistory?: AiConversationTurn[];
}

export function buildAiPayload(input: {
  prompt: string;
  companyId?: string;
  contextSummary?: string;
  activeApp?: string;
  screen?: Record<string, unknown> | null;
  screenSummary?: string;
  conversationHistory?: AiConversationTurn[];
}): AiChatRequest {
  return {
    prompt: String(input.prompt ?? '').trim(),
    ...(input.companyId ? { companyId: String(input.companyId) } : {}),
    ...(input.contextSummary ? { contextSummary: String(input.contextSummary) } : {}),
    ...(input.activeApp ? { activeApp: String(input.activeApp) } : {}),
    ...(input.screen ? { screen: input.screen } : {}),
    ...(input.screenSummary ? { screenSummary: String(input.screenSummary) } : {}),
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
