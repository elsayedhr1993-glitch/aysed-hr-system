import crypto from 'crypto';
import { maskAuditSnapshot } from '../src/security/auditMask';

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'export',
  'view_sensitive',
  'login',
  'login_failure',
  'permission_change',
  'customization',
  'device_rejected',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_DEFAULT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuditEvent {
  id: string;
  at: string;
  userId: string;
  userName: string;
  role: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string;
  companyId: string;
}

const events: AuditEvent[] = [];

export function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === 'string' && (AUDIT_ACTIONS as readonly string[]).includes(value);
}

export function requestIp(req: {
  headers?: Record<string, unknown> | { [key: string]: unknown };
  socket?: { remoteAddress?: string | null };
  ip?: string;
}): string {
  const headers = (req.headers || {}) as Record<string, unknown>;
  const forwarded = String(headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || req.ip || '';
}

/**
 * Append one audit event. companyId is the session value only.
 * There is no update or delete operation on this store.
 */
export function recordAuditEvent(input: {
  actor: { uid?: string; name?: string; role?: string };
  action: AuditAction;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  sessionCompanyId?: string | null;
  at?: string;
}): AuditEvent {
  const event: AuditEvent = {
    id: crypto.randomBytes(8).toString('hex'),
    at: input.at || new Date().toISOString(),
    userId: String(input.actor.uid || 'anonymous'),
    userName: String(input.actor.name || input.actor.uid || 'غير معروف').slice(0, 160),
    role: String(input.actor.role || 'UNKNOWN'),
    action: input.action,
    entityType: String(input.entityType || 'record').slice(0, 80),
    entityId: String(input.entityId || '').slice(0, 180),
    before: maskAuditSnapshot(input.before),
    after: maskAuditSnapshot(input.after),
    ip: String(input.ip || '').slice(0, 80),
    companyId: String(input.sessionCompanyId || ''),
  };
  events.push(event);
  return event;
}

export interface AuditListQuery {
  viewerRole: string;
  sessionCompanyId?: string | null;
  q?: string;
  user?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  now?: number;
}

export function listAuditEvents(query: AuditListQuery): {
  scope: 'platform' | 'company';
  companyId: string;
  events: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
} {
  const platform = query.viewerRole === 'SUPER_ADMIN';
  const companyId = String(query.sessionCompanyId || '');
  const now = query.now ?? Date.now();
  const fromMs = boundMs(query.from, 'start') ?? now - AUDIT_DEFAULT_WINDOW_MS;
  const toMs = boundMs(query.to, 'end') ?? now;
  const q = String(query.q || '').trim().toLowerCase();
  const user = String(query.user || '').trim().toLowerCase();
  const action = String(query.action || '').trim();
  const entity = String(query.entity || '').trim();
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
  const page = Math.max(1, Number(query.page) || 1);

  const matched = events.filter((event) => {
    const at = Date.parse(event.at);
    if (Number.isFinite(fromMs) && at < fromMs) return false;
    if (Number.isFinite(toMs) && at > toMs) return false;
    if (!platform && event.companyId !== companyId) return false;
    if (action && action !== 'ALL' && event.action !== action) return false;
    if (entity && entity !== 'ALL' && event.entityType !== entity) return false;
    if (user) {
      const blob = `${event.userName} ${event.userId}`.toLowerCase();
      if (!blob.includes(user)) return false;
    }
    if (q) {
      const blob = `${event.userName} ${event.userId} ${event.entityType} ${event.entityId} ${event.action} ${event.role}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  const newestFirst = [...matched].reverse();
  const start = (page - 1) * pageSize;
  return {
    scope: platform ? 'platform' : 'company',
    companyId: platform ? '' : companyId,
    events: newestFirst.slice(start, start + pageSize),
    total: newestFirst.length,
    page,
    pageSize,
  };
}

export function __resetAuditLogForTests(): void {
  events.length = 0;
}

export function __auditEventCountForTests(): number {
  return events.length;
}

function boundMs(value: string | undefined, edge: 'start' | 'end'): number | null {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ms = Date.parse(`${trimmed}T00:00:00.000Z`);
    if (!Number.isFinite(ms)) return null;
    return edge === 'end' ? ms + 24 * 60 * 60 * 1000 - 1 : ms;
  }
  const ms = Date.parse(trimmed);
  return Number.isFinite(ms) ? ms : null;
}
