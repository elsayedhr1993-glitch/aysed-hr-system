/**
 * Extract JSON object from Gemini/OpenAI text (markdown fences, preamble, trailing text).
 */
export function stripMarkdownJsonFences(text: string): string {
  let s = String(text || '').trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

export function parseJsonFromAiText(text: string): Record<string, unknown> {
  const cleaned = stripMarkdownJsonFences(text);
  if (!cleaned) return {};

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch (firstErr) {
    console.error('[OCR JSON] direct parse failed:', firstErr);
  }

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const slice = cleaned.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch (secondErr) {
      console.error('[OCR JSON] brace-slice parse failed:', secondErr, { preview: slice.slice(0, 200) });
    }
  }

  return {};
}
