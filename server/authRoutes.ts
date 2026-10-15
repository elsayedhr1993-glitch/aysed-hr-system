import type { Express, Request, Response } from 'express';
import { getAdminAuth, getAdminFirestore } from './firebaseAdmin';
import { requireFirebaseAuthFromHeader, resolveCallerRole } from './apiAuth';
import {
  GENERIC_LOGIN_ERROR,
  GENERIC_RESET_MESSAGE,
  attemptKey,
  clearLoginFailures,
  consumePasswordResetToken,
  generateTemporaryPassword,
  inspectLoginAttempt,
  issuePasswordResetToken,
  recordLoginFailure,
} from './authSecurity';
import { recordIdentityView } from './identityAudit';
import { recordAuditEvent } from './auditLog';
import { sessionCookie } from './securityHeaders';
import { generateTotpSecret, totpKeyUri, verifyTotp } from './totp';
import { canRevealIdentity, totpRequiredForRole } from '../src/security/accessRoles';

const IDLE_MS = 60 * 60 * 1000;
const pendingTotp = new Map<string, { secret: string; expiresAt: number }>();

function clientIp(req: Request): string {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'local';
}

function isSecureRequest(req: Request): boolean {
  const forwarded = String(req.headers['x-forwarded-proto'] || '');
  return Boolean(req.secure || forwarded === 'https');
}

export function registerAuthRoutes(app: Express): void {
  app.post('/api/auth/login-guard', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, error: GENERIC_LOGIN_ERROR });
    const allowed = inspectLoginAttempt(attemptKey(clientIp(req), email)).allowed;
    if (!allowed) return res.status(429).json({ success: false, error: GENERIC_LOGIN_ERROR, locked: true });
    return res.json({ success: true });
  });

  app.post('/api/auth/login-failure', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (email) recordLoginFailure(attemptKey(clientIp(req), email));
    await recordAuditEvent({
      actor: { uid: 'anonymous', name: email || 'غير معروف', role: 'UNKNOWN' },
      action: 'login_failure',
      entityType: 'session',
      entityId: '',
      ip: clientIp(req),
      sessionCompanyId: '',
    });
    return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
  });

  app.post('/api/auth/login-success', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
    clearLoginFailures(attemptKey(clientIp(req), auth.email));
    const tenant = req.sessionTenant;
    const adminRoles = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER']);
    if (tenant && adminRoles.has(tenant.role)) {
      await recordAuditEvent({
        actor: { uid: tenant.uid, name: tenant.email || auth.email, role: tenant.role },
        action: 'login',
        entityType: 'session',
        entityId: tenant.uid,
        ip: clientIp(req),
        sessionCompanyId: tenant.companyId,
      });
    }
    res.setHeader('Set-Cookie', sessionCookie(auth.token, IDLE_MS, isSecureRequest(req)));
    return res.json({ success: true, idleMinutes: IDLE_MS / 60000 });
  });

  app.post('/api/auth/session/touch', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    res.setHeader('Set-Cookie', sessionCookie(auth.token, IDLE_MS, isSecureRequest(req)));
    return res.json({ success: true });
  });

  app.get('/api/auth/session-policy', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(auth.status).json({ success: false, error: 'Unauthorized' });
    const resolved = await resolveCallerRole(auth);
    const mustChangePassword = auth.claims?.mustChangePassword === true;
    let totpEnrolled = false;
    const db = getAdminFirestore();
    if (db) {
      const snap = await db.collection('users').doc(auth.uid).get();
      totpEnrolled = Boolean(snap.data()?.totpSecret);
    }
    return res.json({
      success: true,
      role: resolved.role,
      companyId: req.sessionTenant?.companyId || resolved.companyId || null,
      totpRequired: totpRequiredForRole(resolved.role),
      totpEnrolled,
      mustChangePassword,
      idleMinutes: IDLE_MS / 60000,
    });
  });

  app.get('/api/auth/totp/setup', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const secret = generateTotpSecret();
    pendingTotp.set(auth.uid, { secret, expiresAt: Date.now() + 10 * 60 * 1000 });
    return res.json({
      success: true,
      secret,
      uri: totpKeyUri(secret, auth.email || auth.uid),
    });
  });

  app.post('/api/auth/totp/verify', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const code = String(req.body?.code || '');
    const pending = pendingTotp.get(auth.uid);
    if (pending && pending.expiresAt > Date.now() && verifyTotp(pending.secret, code)) {
      return res.json({ success: true, pendingConfirm: true });
    }
    const db = getAdminFirestore();
    if (!db) return res.status(503).json({ success: false, error: 'Unauthorized' });
    const snap = await db.collection('users').doc(auth.uid).get();
    const secret = String(snap.data()?.totpSecret || '');
    if (!secret || !verifyTotp(secret, code)) {
      return res.status(401).json({ success: false, error: 'رمز التحقق غير صحيح' });
    }
    return res.json({ success: true });
  });

  app.post('/api/auth/totp/confirm', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const pending = pendingTotp.get(auth.uid);
    const code = String(req.body?.code || '');
    if (!pending || pending.expiresAt < Date.now() || !verifyTotp(pending.secret, code)) {
      return res.status(400).json({ success: false, error: 'رمز التحقق غير صحيح' });
    }
    const db = getAdminFirestore();
    if (!db) return res.status(503).json({ success: false, error: 'Firebase admin not configured' });
    await db.collection('users').doc(auth.uid).set({ totpSecret: pending.secret, totpEnabled: true }, { merge: true });
    pendingTotp.delete(auth.uid);
    return res.json({ success: true });
  });

  app.post('/api/auth/password-reset', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.json({ success: true, message: GENERIC_RESET_MESSAGE });
    }
    const admin = getAdminAuth();
    if (admin) {
      try {
        await admin.getUserByEmail(email);
        const token = issuePasswordResetToken(email);
        const origin = `${req.protocol}://${req.get('host')}`;
        console.info('[auth] one-time reset issued', { hasToken: Boolean(token), originHost: req.get('host') });
        void origin;
      } catch {
        /* same response whether or not the account exists */
      }
    }
    return res.json({ success: true, message: GENERIC_RESET_MESSAGE });
  });

  app.post('/api/auth/password-reset/complete', async (req, res) => {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    const email = consumePasswordResetToken(token);
    if (!email || password.length < 8) {
      return res.status(400).json({ success: false, error: 'الرابط غير صالح أو استُخدم من قبل' });
    }
    const admin = getAdminAuth();
    if (!admin) return res.status(503).json({ success: false, error: 'Firebase admin not configured' });
    const user = await admin.getUserByEmail(email);
    await admin.updateUser(user.uid, { password });
    await admin.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), mustChangePassword: false });
    return res.json({ success: true });
  });

  app.post('/api/auth/change-password', async (req, res) => {
    const auth = await requireFirebaseAuthFromHeader(req.headers.authorization);
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const password = String(req.body?.password || '');
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'كلمة المرور قصيرة' });
    }
    const admin = getAdminAuth();
    if (!admin) return res.status(503).json({ success: false, error: 'Firebase admin not configured' });
    const user = await admin.getUser(auth.uid);
    await admin.updateUser(auth.uid, { password });
    await admin.setCustomUserClaims(auth.uid, { ...(user.customClaims || {}), mustChangePassword: false });
    return res.json({ success: true });
  });

  app.post('/api/audit/identity-view', async (req, res) => {
    const tenant = req.sessionTenant;
    if (!tenant) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!canRevealIdentity(tenant.role)) {
      return res.status(403).json({ success: false, error: 'غير مخول لعرض الهوية كاملة' });
    }
    const kind = req.body?.kind === 'passport' ? 'passport' : 'civil';
    const purpose = String(req.body?.purpose || 'view').slice(0, 80);
    const event = recordIdentityView({
      uid: tenant.uid,
      role: tenant.role,
      companyId: tenant.companyId,
      kind,
      purpose,
    });
    await recordAuditEvent({
      actor: { uid: tenant.uid, name: tenant.email, role: tenant.role },
      action: 'view_sensitive',
      entityType: 'identity',
      entityId: kind,
      after: { purpose },
      ip: clientIp(req),
      sessionCompanyId: tenant.companyId,
    });
    return res.json({ success: true, id: event.id });
  });
}

export function newTenantCredentials(): { companyId: string; temporaryPassword: string } {
  return {
    companyId: `comp_${Date.now()}`,
    temporaryPassword: generateTemporaryPassword(),
  };
}
