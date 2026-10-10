import { GoogleGenAI } from '@google/genai';
import { createAuthKeyGeminiClient, type AuthKeyGeminiClient } from './geminiBearerClient.ts';
import {
  getGeminiCredentialFromEnv,
  isGoogleAuthKey,
} from './geminiAuth.ts';

const AISTUDIO_HTTP_HEADERS = {
  'User-Agent': 'aistudio-build',
} as const;

export type GeminiClient = GoogleGenAI | AuthKeyGeminiClient;

function createApiKeyGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: AISTUDIO_HTTP_HEADERS,
    },
  });
}

export function getGeminiClient(): GeminiClient | null {
  const credential = getGeminiCredentialFromEnv();
  if (!credential) {
    return null;
  }
  if (isGoogleAuthKey(credential)) {
    return createAuthKeyGeminiClient(credential);
  }
  return createApiKeyGeminiClient(credential);
}
