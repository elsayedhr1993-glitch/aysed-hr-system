import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isSuperAdminPrincipal } from '../config/superAdminAccess';
import { resolveTenantCompanyIdForEmail } from './tenantCompanyLookup';
import { readCompanyIdFromUrl } from '../utils/tenantCompanyId';

/** Idempotent: align users/{uid} with company from email + URL (fixes external deep links). */
export async function ensureSessionTenantBinding(
  uid: string,
  email: string,
  role?: string
): Promise<string | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!uid || !normalizedEmail) return undefined;

  if (isSuperAdminPrincipal({ email: normalizedEmail, role })) {
    await setDoc(
      doc(db, 'users', uid),
      { email: normalizedEmail, role: 'SUPER_ADMIN' },
      { merge: true }
    ).catch(() => {});
    await auth.currentUser?.getIdToken(true).catch(() => {});
    return undefined;
  }

  const companyId = await resolveTenantCompanyIdForEmail(
    normalizedEmail,
    undefined,
    readCompanyIdFromUrl()
  );
  if (!companyId) return undefined;

  const nextRole = String(role || 'COMPANY_ADMIN').toUpperCase() === 'TENANT_ADMIN'
    ? 'COMPANY_ADMIN'
    : String(role || 'COMPANY_ADMIN').toUpperCase();

  await setDoc(
    doc(db, 'users', uid),
    { email: normalizedEmail, companyId, role: nextRole },
    { merge: true }
  ).catch(() => {});

  await auth.currentUser?.getIdToken(true).catch(() => {});
  window.dispatchEvent(new CustomEvent('aysed_tenant_bound', { detail: { companyId } }));
  return companyId;
}
