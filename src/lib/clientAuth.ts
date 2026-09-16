import { auth } from './firebase';

const AUTH_TOKEN_KEY = 'aysed_auth_token';

/** Resolve Firebase ID token for authenticated API calls (OCR, AI chat, etc.). */
export async function getClientAuthToken(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && auth.currentUser) {
      const fresh = await auth.currentUser.getIdToken(false);
      if (fresh && fresh.length > 20 && fresh !== 'session-token') {
        return fresh;
      }
    }
  } catch {
    // Fall through to stored token
  }

  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (stored && stored !== 'session-token' && stored.length > 20) {
      return stored;
    }
  } catch {
    return null;
  }

  return null;
}

export async function buildAuthedJsonHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = await getClientAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
