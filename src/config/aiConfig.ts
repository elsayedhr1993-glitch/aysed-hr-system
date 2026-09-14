export const AI_MODELS = {
  chat: process.env.AI_CHAT_MODEL || 'gemini-2.5-flash',
  ocr: process.env.AI_OCR_MODEL || 'gemini-2.5-flash',
  fallback: process.env.AI_FALLBACK_MODEL || 'gemini-2.5-pro',
} as const;

export interface AiConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  prompt: string;
  contextSummary?: string;
  conversationHistory?: AiConversationTurn[];
}

export function buildAiPayload(input: {
  prompt: string;
  contextSummary?: string;
  conversationHistory?: AiConversationTurn[];
}): AiChatRequest {
  return {
    prompt: String(input.prompt ?? '').trim(),
    ...(input.contextSummary ? { contextSummary: String(input.contextSummary) } : {}),
    ...(Array.isArray(input.conversationHistory) && input.conversationHistory.length > 0
      ? { conversationHistory: input.conversationHistory.map((item) => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: String(item.content ?? '').trim(),
        })) }
      : {}),
  };
}
