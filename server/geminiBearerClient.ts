/**
 * Gemini Auth Keys (AQ.*): native REST (x-goog-api-key) with OpenAI-compat Bearer fallback.
 */

const GEMINI_REST_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OPENAI_COMPAT_BASE = `${GEMINI_REST_BASE}/openai`;

function normalizeContents(contents: unknown): Array<{ role?: string; parts: unknown[] }> {
  if (Array.isArray(contents)) {
    return contents as Array<{ role?: string; parts: unknown[] }>;
  }
  if (contents && typeof contents === 'object' && 'parts' in (contents as object)) {
    return [{ parts: (contents as { parts: unknown[] }).parts }];
  }
  return [{ parts: [{ text: String(contents ?? '') }] }];
}

function buildGenerationConfig(config: Record<string, unknown> | undefined) {
  if (!config) return undefined;
  const out: Record<string, unknown> = {};
  for (const key of [
    'temperature',
    'topP',
    'topK',
    'maxOutputTokens',
    'responseMimeType',
    'responseSchema',
    'responseJsonSchema',
  ] as const) {
    if (config[key] !== undefined) out[key] = config[key];
  }
  return Object.keys(out).length ? out : undefined;
}

function extractNativeText(data: Record<string, unknown>): string {
  const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
  const parts = candidates?.[0]?.content?.parts;
  if (!parts?.length) return '';
  return parts.map((p) => p.text ?? '').join('');
}

function partsToOpenAiContent(parts: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue;
    const p = part as Record<string, unknown>;
    if (typeof p.text === 'string') {
      out.push({ type: 'text', text: p.text });
      continue;
    }
    const inline = p.inlineData as { data?: string; mimeType?: string } | undefined;
    if (inline?.data) {
      const mime = inline.mimeType || 'image/jpeg';
      out.push({
        type: 'image_url',
        image_url: { url: `data:${mime};base64,${inline.data}` },
      });
    }
  }
  return out.length ? out : [{ type: 'text', text: '' }];
}

async function nativeGenerateContent(
  apiKey: string,
  model: string,
  params: { contents?: unknown; config?: Record<string, unknown> },
) {
  const config = params.config || {};
  const body: Record<string, unknown> = {
    contents: normalizeContents(params.contents),
  };

  const generationConfig = buildGenerationConfig(config);
  if (generationConfig) body.generationConfig = generationConfig;

  const sys = config.systemInstruction;
  if (sys) {
    body.systemInstruction =
      typeof sys === 'string' ? { parts: [{ text: sys }] } : sys;
  }

  const url = `${GEMINI_REST_BASE}/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
      'User-Agent': 'aistudio-build',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = new Error(JSON.stringify(data)) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return { text: extractNativeText(data), raw: data };
}

async function openAiCompatGenerateContent(
  apiKey: string,
  model: string,
  params: { contents?: unknown; config?: Record<string, unknown> },
) {
  const config = params.config || {};
  const normalized = normalizeContents(params.contents);
  const userParts = normalized.flatMap((c) => c.parts);
  const userContent = partsToOpenAiContent(userParts);

  const messages: Array<{ role: string; content: unknown }> = [];
  const sys = config.systemInstruction;
  if (sys) {
    messages.push({
      role: 'system',
      content: typeof sys === 'string' ? sys : JSON.stringify(sys),
    });
  }
  messages.push({ role: 'user', content: userContent });

  const body: Record<string, unknown> = { model, messages };
  if (config.temperature !== undefined) body.temperature = config.temperature;
  if (config.responseMimeType === 'application/json') {
    body.response_format = { type: 'json_object' };
  }

  const url = `${OPENAI_COMPAT_BASE}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'aistudio-build',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
  const text = choices?.[0]?.message?.content ?? '';
  return { text, raw: data };
}

function paramsIncludeVision(params: { contents?: unknown }): boolean {
  try {
    return JSON.stringify(params.contents ?? '').includes('inlineData');
  } catch {
    return false;
  }
}

export function createAuthKeyGeminiClient(authKey: string) {
  const apiKey = authKey.trim();

  return {
    models: {
      async generateContent(params: {
        model: string;
        contents?: unknown;
        config?: Record<string, unknown>;
      }) {
        const model = String(params.model || '').trim();
        if (!model) throw new Error('model is required');

        const vision = paramsIncludeVision(params);

        // Vision/OCR: OpenAI-compat + Bearer is most reliable for AQ keys in production.
        if (vision) {
          try {
            return await openAiCompatGenerateContent(apiKey, model, params);
          } catch (openAiErr) {
            try {
              return await nativeGenerateContent(apiKey, model, params);
            } catch {
              throw openAiErr;
            }
          }
        }

        try {
          return await nativeGenerateContent(apiKey, model, params);
        } catch (nativeErr: unknown) {
          const status = (nativeErr as { status?: number })?.status;
          const msg = String((nativeErr as Error)?.message || nativeErr);
          const retryWithBearer =
            status === 401 ||
            msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            msg.includes('API_KEY_SERVICE_BLOCKED');

          if (!retryWithBearer) throw nativeErr;

          return await openAiCompatGenerateContent(apiKey, model, params);
        }
      },
    },
  };
}

export type AuthKeyGeminiClient = ReturnType<typeof createAuthKeyGeminiClient>;

/** @deprecated use createAuthKeyGeminiClient */
export const createBearerGeminiClient = createAuthKeyGeminiClient;
