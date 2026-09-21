import { isSuperAdminEmail } from '../src/config/superAdminAccess.ts';
import { getAdminAuth, getAdminFirestore } from './firebaseAdmin.ts';

export type AuthCheckResult =
  | { ok: true; token: string; uid: string; email: string; claims: Record<string, unknown>; status: number }
  | { ok: false; error: string; status: number };

export async function requireFirebaseAuthFromHeader(
  authHeader: string | string[] | undefined
): Promise<AuthCheckResult> {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header || typeof header !== 'string') {
    return { ok: false, error: 'Missing Authorization header', status: 401 };
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { ok: false, error: 'Invalid Authorization format', status: 401 };
  }

  const token = match[1].trim();
  if (!token || token.length < 20) {
    return { ok: false, error: 'Invalid token format', status: 401 };
  }

  const auth = getAdminAuth();
  if (!auth) {
    return { ok: false, error: 'Firebase admin not configured', status: 503 };
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      ok: true,
      token,
      uid: decoded.uid,
      email: String(decoded.email || '').toLowerCase(),
      claims: decoded as Record<string, unknown>,
      status: 200,
    };
  } catch {
    return { ok: false, error: 'Invalid Firebase ID token', status: 401 };
  }
}

export async function resolveCallerRole(authCheck: {
  uid: string;
  email?: string;
  claims?: Record<string, unknown>;
}): Promise<{ role: string; companyId?: string }> {
  const email = String(authCheck.email || '').toLowerCase();
  if (isSuperAdminEmail(email)) {
    const claimCompanyId = authCheck.claims?.companyId
      ? String(authCheck.claims.companyId)
      : undefined;
    return { role: 'SUPER_ADMIN', companyId: claimCompanyId };
  }

  const claimRole = String(authCheck.claims?.role || '').toUpperCase();
  const claimCompanyId = authCheck.claims?.companyId
    ? String(authCheck.claims.companyId)
    : undefined;

  if (claimRole === 'SUPER_ADMIN' || claimRole === 'COMPANY_ADMIN' || claimRole === 'TENANT_ADMIN') {
    return { role: claimRole === 'TENANT_ADMIN' ? 'COMPANY_ADMIN' : claimRole, companyId: claimCompanyId };
  }

  try {
    const dbAdmin = getAdminFirestore();
    if (dbAdmin) {
      const snap = await dbAdmin.collection('users').doc(authCheck.uid).get();
      if (snap.exists) {
        const data = snap.data() || {};
        const role = String(data.role || 'COMPANY_ADMIN').toUpperCase();
        const companyId = data.companyId ? String(data.companyId) : claimCompanyId;
        if (role === 'SUPER_ADMIN' || isSuperAdminEmail(String(data.email || email))) {
          return { role: 'SUPER_ADMIN', companyId };
        }
        const normalizedRole = role === 'TENANT_ADMIN' ? 'COMPANY_ADMIN' : role;
        return {
          role: normalizedRole,
          companyId,
        };
      }
    }
  } catch (err) {
    console.warn('[Auth] Failed to resolve role from Firestore users doc:', err);
  }

  return { role: 'COMPANY_ADMIN', companyId: claimCompanyId };
}
