import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isSuperAdminPrincipal } from '../config/superAdminAccess';
import { resolveTenantCompanyIdForEmail } from './tenantCompanyLookup';

/** Browser profile patch. Role stays in server claims and is never written here. */
export function sessionBindingPatch(input: {
  email: string;
  companyId?: string;
  superAdmin?: boolean;
}): Record<string, string> {
  const email = input.email.trim().toLowerCase();
  if (input.superAdmin || !input.companyId) return { email };
  return {
    email,
    companyId: input.companyId,
    company_id: input.companyId,
    activeCompanyId: input.companyId,
  };
}

export function profileCreatePatch(input: {
  email: string;
  name: string;
  companyId?: string | null;
  photoURL?: string;
  createdAt: string;
}): Record<string, string | null> {
  return {
    email: input.email,
    name: input.name,
    companyId: input.companyId || null,
    company_id: input.companyId || null,
    activeCompanyId: input.companyId || null,
    photoURL: input.photoURL || '',
    createdAt: input.createdAt,
  };
}

/** Idempotent: align users/{uid} with the company resolved from the account email. */
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
      sessionBindingPatch({ email: normalizedEmail, superAdmin: true }),
      { merge: true }
    ).catch(() => {});
    await auth.currentUser?.getIdToken(true).catch(() => {});
    return undefined;
  }

  const companyId = await resolveTenantCompanyIdForEmail(normalizedEmail);
  if (!companyId) return undefined;

  await setDoc(
    doc(db, 'users', uid),
    sessionBindingPatch({ email: normalizedEmail, companyId }),
    { merge: true }
  ).catch(() => {});

  await auth.currentUser?.getIdToken(true).catch(() => {});
  window.dispatchEvent(new CustomEvent('aysed_tenant_bound', { detail: { companyId } }));
  return companyId;
}
