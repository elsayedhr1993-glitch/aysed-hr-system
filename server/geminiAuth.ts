/** Google AI Studio Auth Keys (AQ.*) vs classic API keys (AIzaSy*). */

export function getGeminiCredentialFromEnv(): string | null {
  const raw =
    process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed.includes('YOUR_') || trimmed.includes('MY_GEMINI')) return null;
  return trimmed;
}

/** Auth Key from AI Studio (AQ.*) — pass via x-goog-api-key, not Authorization Bearer. */
export function isGoogleAuthKey(credential: string): boolean {
  return String(credential || '').trim().startsWith('AQ.');
}

export function isClassicGeminiApiKey(credential: string): boolean {
  const v = String(credential || '').trim();
  return v.startsWith('AIza') || v.startsWith('AIzaSy');
}
