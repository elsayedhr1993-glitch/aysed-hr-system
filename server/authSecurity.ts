import crypto from 'crypto';

export const GENERIC_LOGIN_ERROR = 'بيانات الدخول غير صحيحة';
export const GENERIC_RESET_MESSAGE = 'إذا كان الحساب موجوداً فسيصلك رابط لإعادة التعيين';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const RESET_TTL_MS = 20 * 60 * 1000;

interface AttemptState {
  failures: number;
  windowStart: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptState>();
const resetTokens = new Map<string, { email: string; expiresAt: number; used: boolean }>();

export function attemptKey(ip: string, email: string): string {
  return crypto.createHash('sha256').update(`${ip}|${email.trim().toLowerCase()}`).digest('hex');
}

export function inspectLoginAttempt(key: string, now = Date.now()): { allowed: boolean } {
  const state = attempts.get(key);
  if (!state) return { allowed: true };
  if (state.lockedUntil > now) return { allowed: false };
  if (now - state.windowStart > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true };
  }
  return { allowed: state.failures < MAX_FAILURES };
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const state = attempts.get(key);
  if (!state || now - state.windowStart > WINDOW_MS) {
    attempts.set(key, { failures: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  state.failures += 1;
  if (state.failures >= MAX_FAILURES) state.lockedUntil = now + LOCK_MS;
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}

export function generateTemporaryPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(16);
  let body = '';
  for (const byte of bytes) body += alphabet[byte % alphabet.length];
  return `Ay${body}#9`;
}

export function issuePasswordResetToken(email: string, now = Date.now()): string {
  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { email: email.trim().toLowerCase(), expiresAt: now + RESET_TTL_MS, used: false });
  return token;
}

export function consumePasswordResetToken(token: string, now = Date.now()): string | null {
  const record = resetTokens.get(token);
  if (!record || record.used || record.expiresAt < now) return null;
  record.used = true;
  resetTokens.delete(token);
  return record.email;
}

export function __resetAuthSecurityForTests(): void {
  attempts.clear();
  resetTokens.clear();
}
