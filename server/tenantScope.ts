import type { NextFunction, Request, Response } from 'express';
import { normalizeHrRole, type HrRole } from '../src/security/accessRoles';

export interface SessionTenant {
  uid: string;
  email: string;
  role: HrRole;
  companyId?: string;
}

export interface VerifiedPrincipal {
  ok: true;
  uid: string;
  email?: string;
  claims?: Record<string, unknown>;
}

type AuthFailure = { ok: false; error?: string; status?: number };

declare global {
  namespace Express {
    interface Request {
      sessionTenant?: SessionTenant;
    }
  }
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return undefined;
}

/**
 * Company scope comes from the verified token claim or the server user profile.
 * Request URL, body, and x-company-id are never consulted.
 */
export function sessionCompanyFromPrincipal(input: {
  claims?: Record<string, unknown> | null;
  userDoc?: Record<string, unknown> | null;
}): string | undefined {
  const doc = input.userDoc || {};
  const claims = input.claims || {};
  return (
    firstString(doc.companyId, doc.company_id, doc.activeCompanyId) ||
    firstString(claims.companyId, claims.company_id)
  );
}

export function sessionRoleFromPrincipal(input: {
  claims?: Record<string, unknown> | null;
  userDoc?: Record<string, unknown> | null;
  email?: string;
  isPlatformAdmin?: boolean;
}): HrRole {
  if (input.isPlatformAdmin) return 'SUPER_ADMIN';
  const docRole = firstString(input.userDoc?.role);
  const claimRole = firstString(input.claims?.role);
  const normalized = normalizeHrRole(docRole || claimRole);
  return normalized;
}

const PUBLIC_API = new Set([
  '/api/health',
  '/api/auth/login-guard',
  '/api/auth/login-failure',
  '/api/auth/password-reset',
  '/api/auth/password-reset/complete',
]);

const DEVICE_API_PREFIXES = [
  '/api/biometrics/sync',
  '/api/zkteco',
  '/api/attendance/live-push',
];

function isDeviceIngest(path: string): boolean {
  return DEVICE_API_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function promoteSessionCookie(req: Request): void {
  if (req.headers.authorization || req.headers.Authorization) return;
  const raw = String(req.headers.cookie || '');
  const match = raw.match(/(?:^|;\s*)aysed_session=([^;]+)/);
  if (!match) return;
  try {
    const token = decodeURIComponent(match[1]);
    if (token.length > 20) req.headers.authorization = `Bearer ${token}`;
  } catch {
    /* malformed cookie is ignored */
  }
}

export function stripClientCompanyHints(req: Request): void {
  if (req.query) {
    delete req.query.companyId;
    delete req.query.cid;
  }
  const headers = req.headers as Record<string, unknown>;
  delete headers['x-company-id'];
  delete headers['X-Company-Id'];
}

export function applySessionCompanyOnBody(
  body: unknown,
  sessionCompanyId: string | undefined
): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: true };
  const record = body as Record<string, unknown>;
  if (!('companyId' in record)) return { ok: true };
  const incoming = String(record.companyId ?? '').trim();
  if (incoming && incoming !== (sessionCompanyId || '')) {
    return { ok: false, error: 'معرّف المنشأة يُؤخذ من الجلسة فقط' };
  }
  record.companyId = sessionCompanyId;
  return { ok: true };
}

export function createTenantScopeMiddleware(deps: {
  requireAuth: (req: Request) => Promise<VerifiedPrincipal | AuthFailure>;
  resolveTenant: (auth: VerifiedPrincipal) => Promise<{ role: string; companyId?: string }>;
}) {
  return async function tenantScope(req: Request, res: Response, next: NextFunction) {
    if (!req.path.startsWith('/api')) return next();
    if (req.method === 'OPTIONS') return next();

    stripClientCompanyHints(req);
    promoteSessionCookie(req);

    if (PUBLIC_API.has(req.path)) return next();

    if (isDeviceIngest(req.path)) {
      if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        delete (req.body as Record<string, unknown>).companyId;
      }
      const header = req.headers.authorization || req.headers.Authorization;
      if (header) {
        const auth = await deps.requireAuth(req);
        if (auth.ok) {
          const resolved = await deps.resolveTenant(auth);
          req.sessionTenant = {
            uid: auth.uid,
            email: String(auth.email || '').toLowerCase(),
            role: normalizeHrRole(resolved.role),
            companyId: resolved.companyId ? String(resolved.companyId) : undefined,
          };
        }
      }
      return next();
    }

    if (req.path === '/api/admin/create-tenant' && req.body && typeof req.body === 'object') {
      delete (req.body as Record<string, unknown>).companyId;
    }

    const auth = await deps.requireAuth(req);
    if (auth.ok === false) {
      return res.status(auth.status || 401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const resolved = await deps.resolveTenant(auth);
    const tenant: SessionTenant = {
      uid: auth.uid,
      email: String(auth.email || '').toLowerCase(),
      role: normalizeHrRole(resolved.role),
      companyId: resolved.companyId ? String(resolved.companyId) : undefined,
    };
    req.sessionTenant = tenant;

    if (req.path !== '/api/admin/create-tenant') {
      const scoped = applySessionCompanyOnBody(req.body, tenant.companyId);
      if (scoped.ok === false) {
        return res.status(403).json({ success: false, error: scoped.error, code: 'COMPANY_SCOPE' });
      }
    }

    return next();
  };
}
