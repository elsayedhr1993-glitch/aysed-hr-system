import crypto from 'crypto';

export interface IdentityViewEvent {
  id: string;
  uid: string;
  role: string;
  companyId?: string;
  kind: 'civil' | 'passport';
  purpose: string;
  at: string;
}

const events: IdentityViewEvent[] = [];

/** In-memory only. Do not write this to live Firestore or Supabase. */
export function recordIdentityView(input: Omit<IdentityViewEvent, 'id' | 'at'>): IdentityViewEvent {
  const event: IdentityViewEvent = {
    ...input,
    id: crypto.randomBytes(8).toString('hex'),
    at: new Date().toISOString(),
  };
  events.unshift(event);
  if (events.length > 500) events.pop();
  return event;
}

export function identityViewCount(): number {
  return events.length;
}

export function __resetIdentityAuditForTests(): void {
  events.length = 0;
}
