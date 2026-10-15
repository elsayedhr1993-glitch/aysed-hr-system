import { canRevealIdentity } from './accessRoles';

export type IdentityKind = 'civil' | 'passport';

const EXPIRY_HINT = /expiry|expir|انتهاء|تاريخ/i;

export function identityKindFromField(fieldKey?: string, label?: string): IdentityKind | null {
  const blob = `${fieldKey || ''} ${label || ''}`;
  if (EXPIRY_HINT.test(blob)) return null;
  if (/passport|جواز/i.test(blob)) return 'passport';
  if (/civil[\s_-]?id|civilid|رقم\s*مدني|الرقم المدني/i.test(blob)) return 'civil';
  return null;
}

/** Show only the tail of a civil id or passport. Empty stays empty. */
export function maskIdentity(raw: string | number | null | undefined, kind: IdentityKind): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const tail = kind === 'civil' ? 3 : 2;
  if (value.length <= tail) return '•'.repeat(value.length);
  const hidden = Math.max(4, value.length - tail);
  return `${'•'.repeat(hidden)}${value.slice(-tail)}`;
}

/** Full value only after an authorized reveal. Everyone else keeps the mask. */
export function shownIdentity(
  value: string | number | null | undefined,
  kind: IdentityKind,
  role: string | null | undefined,
  revealed: boolean,
): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (revealed && canRevealIdentity(role)) return raw;
  return maskIdentity(raw, kind);
}
