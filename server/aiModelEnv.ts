/** Server-only Gemini model selection (process.env; no VITE_* client mirrors). */

/** Stable fast models; override with AI_CHAT_MODEL in .env */
export const DEFAULT_CHAT_MODEL = 'gemini-2.5-flash';

export const DEFAULT_OCR_MODEL = 'gemini-2.5-flash';

function envModel(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const v = String(raw).trim();
  if (!v || v.includes('YOUR_') || v.includes('MY_GEMINI')) return undefined;
  return v;
}

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

/** Chat / copilot / summarize — same default as scripts/smoke-gemini-key.mjs */
export function getChatModelCandidates(): string[] {
  const primary = envModel('AI_CHAT_MODEL') || DEFAULT_CHAT_MODEL;
  const extra = (envModel('AI_CHAT_MODEL_FALLBACKS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const optionalFallback = envModel('AI_FALLBACK_MODEL');
  return uniqueModels([
    primary,
    ...extra,
    DEFAULT_CHAT_MODEL,
    'gemini-2.5-pro',
    'gemini-3.8-flash',
    ...(optionalFallback ? [optionalFallback] : []),
  ]);
}

export function getConnectivityTestModels(): string[] {
  return getChatModelCandidates();
}
