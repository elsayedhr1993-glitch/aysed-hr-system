import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { cleanFirestoreData, db, getCompaniesCollectionName, provisionTenantAuth } from '../lib/firebase';
import { loadCompanySettings, saveCompanySettings } from './companySettingsStorage';

export type TenantSubscriptionState = 'draft' | 'approved' | 'rejected' | 'suspended';

export interface TenantSubscriptionEditInput {
  /** Row id in subscriptions table (req-* or comp-*) */
  rowId: string;
  companyIdHint?: string;
  companyName: string;
  requesterName: string;
  phone: string;
  email: string;
  previousEmail: string;
  planType: string;
  empCount: string;
  state: TenantSubscriptionState;
  newPassword?: string;
}

export interface TenantSyncResult {
  companyId: string;
  steps: string[];
  warnings: string[];
}

function isCompanyDocId(id: string): boolean {
  return /^comp[-_]/i.test(id);
}

function subscriptionFeeForEmpCount(empCount: string): number {
  if (empCount === '1-10') return 50;
  if (empCount === '11-50') return 100;
  if (empCount === '51-200') return 200;
  return 250;
}

function mapStateToCompanyFlags(state: TenantSubscriptionState) {
  const isActive = state === 'approved';
  const companyStatus = state === 'approved' ? 'active' : state === 'suspended' ? 'suspended' : state === 'rejected' ? 'rejected' : 'pending';
  const subscriptionStatus =
    state === 'approved' ? 'active' : state === 'suspended' ? 'suspended' : state === 'rejected' ? 'cancelled' : 'draft';
  return { isActive, companyStatus, subscriptionStatus };
}

export async function resolveTenantCompanyId(
  rowId: string,
  companyName: string,
  email: string,
  companyIdHint?: string
): Promise<string> {
  if (companyIdHint && isCompanyDocId(companyIdHint)) return companyIdHint;
  if (isCompanyDocId(rowId)) return rowId;

  const companiesCollection = getCompaniesCollectionName();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = companyName.trim().toLowerCase();

  try {
    const reqSnap = await getDoc(doc(db, 'subscription_requests', rowId));
    if (reqSnap.exists()) {
      const fromReq = reqSnap.data()?.companyId as string | undefined;
      if (fromReq && isCompanyDocId(fromReq)) return fromReq;
    }
  } catch {
    /* ignore */
  }

  const compSnap = await getDocs(collection(db, companiesCollection));
  for (const d of compSnap.docs) {
    const c = d.data();
    const emails = [
      c.email,
      c.adminEmail,
      c.adminUsername,
    ]
      .filter(Boolean)
      .map((v: string) => String(v).toLowerCase());
    const names = [c.nameAr, c.nameEn, c.companyName, c.name]
      .filter(Boolean)
      .map((v: string) => String(v).toLowerCase());

    if (
      d.id === rowId ||
      (c.companyId && String(c.companyId) === rowId) ||
      names.includes(normalizedName) ||
      emails.includes(normalizedEmail)
    ) {
      return d.id;
    }
  }

  if (rowId.startsWith('req-')) {
    return `comp-${rowId.slice(4)}`;
  }

  return rowId;
}

async function updateUsersForTenant(
  companyId: string,
  patch: Record<string, unknown>,
  emailHints: string[]
): Promise<number> {
  let updated = 0;
  const seen = new Set<string>();

  const byCompany = await getDocs(query(collection(db, 'users'), where('companyId', '==', companyId)));
  for (const d of byCompany.docs) {
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    await setDoc(doc(db, 'users', d.id), cleanFirestoreData({ ...patch, updatedAt: new Date().toISOString() }), {
      merge: true,
    });
    updated += 1;
  }

  for (const hint of emailHints) {
    const normalized = hint.trim().toLowerCase();
    if (!normalized.includes('@')) continue;
    const byEmail = await getDocs(query(collection(db, 'users'), where('email', '==', normalized)));
    for (const d of byEmail.docs) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      await setDoc(
        doc(db, 'users', d.id),
        cleanFirestoreData({ ...patch, companyId, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
      updated += 1;
    }
  }

  return updated;
}

export async function syncTenantSubscriptionEdit(
  input: TenantSubscriptionEditInput,
  deps: { getAuthedHeaders: () => Promise<Record<string, string>> }
): Promise<TenantSyncResult> {
  const steps: string[] = [];
  const warnings: string[] = [];
  const companiesCollection = getCompaniesCollectionName();

  const cleanEmail = input.email.trim().toLowerCase();
  const previousEmail = (input.previousEmail || input.email).trim().toLowerCase();
  const companyId = await resolveTenantCompanyId(input.rowId, input.companyName, cleanEmail, input.companyIdHint);
  const { isActive, companyStatus, subscriptionStatus } = mapStateToCompanyFlags(input.state);
  const now = new Date().toISOString();

  const companyPayload = cleanFirestoreData({
    id: companyId,
    companyId,
    companyName: input.companyName.trim(),
    nameAr: input.companyName.trim(),
    nameEn: input.companyName.trim(),
    name: input.companyName.trim(),
    ownerName: input.requesterName.trim(),
    requesterName: input.requesterName.trim(),
    phone: input.phone.trim(),
    contactPhone: input.phone.trim(),
    email: cleanEmail,
    adminEmail: cleanEmail,
    adminUsername: cleanEmail,
    plan: input.planType,
    planType: input.planType,
    empCount: input.empCount,
    employee_count: input.empCount,
    status: companyStatus,
    state: companyStatus,
    isActive,
    updatedAt: now,
  });

  await setDoc(doc(db, companiesCollection, companyId), companyPayload, { merge: true });
  steps.push('companies');

  let requestDocId = input.rowId.startsWith('req-') ? input.rowId : '';
  if (!requestDocId) {
    const linkedReq = await getDocs(
      query(collection(db, 'subscription_requests'), where('companyId', '==', companyId))
    );
    requestDocId = linkedReq.docs[0]?.id || `req-${companyId.replace(/^comp[-_]/i, '')}`;
  }
  await setDoc(
    doc(db, 'subscription_requests', requestDocId),
    cleanFirestoreData({
      companyId,
      companyName: input.companyName.trim(),
      name: input.companyName.trim(),
      requesterName: input.requesterName.trim(),
      requester_name: input.requesterName.trim(),
      phone: input.phone.trim(),
      email: cleanEmail,
      planType: input.planType,
      plan_type: input.planType,
      empCount: input.empCount,
      emp_count: input.empCount,
      status: input.state,
      state: input.state,
      updatedAt: now,
    }),
    { merge: true }
  );
  steps.push('subscription_requests');

  const subSnap = await getDocs(collection(db, 'subscriptions'));
  let subscriptionLinked = false;
  for (const d of subSnap.docs) {
    const val = d.data();
    const matches =
      val.companyId === companyId ||
      d.id === input.rowId ||
      String(val.companyName || '').toLowerCase() === input.companyName.trim().toLowerCase() ||
      String(val.email || '').toLowerCase() === cleanEmail ||
      String(val.email || '').toLowerCase() === previousEmail;

    if (matches) {
      subscriptionLinked = true;
      await setDoc(
        doc(db, 'subscriptions', d.id),
        cleanFirestoreData({
          companyId,
          companyName: input.companyName.trim(),
          ownerName: input.requesterName.trim(),
          email: cleanEmail,
          phone: input.phone.trim(),
          planType: input.planType,
          empCount: input.empCount,
          status: subscriptionStatus,
          subscriptionFee: subscriptionFeeForEmpCount(input.empCount),
          updatedAt: now,
        }),
        { merge: true }
      );
    }
  }

  if (!subscriptionLinked) {
    const subId = `sub-${companyId.replace(/^comp[-_]/, '')}`;
    await setDoc(
      doc(db, 'subscriptions', subId),
      cleanFirestoreData({
        id: subId,
        companyId,
        companyName: input.companyName.trim(),
        ownerName: input.requesterName.trim(),
        email: cleanEmail,
        phone: input.phone.trim(),
        planType: input.planType,
        empCount: input.empCount,
        status: subscriptionStatus,
        subscriptionFee: subscriptionFeeForEmpCount(input.empCount),
        startDate: now.split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
      }),
      { merge: true }
    );
  }
  steps.push('subscriptions');

  const usersUpdated = await updateUsersForTenant(
    companyId,
    {
      email: cleanEmail,
      displayName: input.requesterName.trim(),
      companyName: input.companyName.trim(),
      role: 'COMPANY_ADMIN',
      isActive,
      status: companyStatus,
    },
    [previousEmail, cleanEmail]
  );
  if (usersUpdated > 0) steps.push(`users (${usersUpdated})`);
  else warnings.push('لم يُعثر على سجل users — سيتم إنشاء/ربط Auth عند التفعيل.');

  try {
    const currentSettings = await loadCompanySettings(companyId, {
      nameAr: input.companyName.trim(),
      nameEn: input.companyName.trim(),
      phone: input.phone.trim(),
      email: cleanEmail,
    });
    await saveCompanySettings(companyId, {
      ...currentSettings,
      companyNameAr: input.companyName.trim(),
      companyNameEn: input.companyName.trim(),
      phone: input.phone.trim(),
      email: cleanEmail,
    });
    steps.push('company_settings');
  } catch (e) {
    warnings.push('تعذر تحديث company_settings');
    console.warn(e);
  }

  const headers = await deps.getAuthedHeaders();

  if (cleanEmail !== previousEmail && previousEmail.includes('@')) {
    try {
      const res = await fetch('/api/admin/update-user-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentEmail: previousEmail, newEmail: cleanEmail }),
      });
      const data = await res.json();
      if (data.success) steps.push('auth_email');
      else warnings.push(data.error || 'فشل تحديث بريد Auth');
    } catch {
      warnings.push('فشل الاتصال لتحديث بريد Auth');
    }
  }

  if (input.newPassword && input.newPassword.length >= 8) {
    try {
      const res = await fetch('/api/admin/force-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: cleanEmail, newPassword: input.newPassword }),
      });
      const data = await res.json();
      if (data.success) steps.push('auth_password');
      else warnings.push(data.error || 'فشل تحديث كلمة المرور');
    } catch {
      warnings.push('فشل الاتصال لتحديث كلمة المرور');
    }
  } else if (input.newPassword && input.newPassword.length > 0) {
    warnings.push('كلمة المرور أقل من 8 أحرف — لم يتم تطبيقها.');
  }

  if (input.state === 'approved') {
    try {
      const authResult = await provisionTenantAuth({
        email: cleanEmail,
        password: input.newPassword && input.newPassword.length >= 8 ? input.newPassword : undefined,
        companyName: input.companyName.trim(),
        companyId,
        ownerName: input.requesterName.trim(),
        phone: input.phone.trim(),
        planType: input.planType,
      });
      if (authResult.success && authResult.uid) {
        await setDoc(
          doc(db, 'users', authResult.uid),
          cleanFirestoreData({
            email: cleanEmail,
            displayName: input.requesterName.trim(),
            role: 'COMPANY_ADMIN',
            companyId,
            companyName: input.companyName.trim(),
            isActive: true,
            status: 'active',
            updatedAt: now,
          }),
          { merge: true }
        );
        steps.push('auth_provision');
      }
    } catch {
      warnings.push('تعذر تأكيد حساب Auth للمنشأة');
    }

    try {
      const res = await fetch('/api/admin/set-tenant-active', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: cleanEmail, active: true }),
      });
      const data = await res.json();
      if (data.success) steps.push('auth_active');
    } catch {
      /* optional */
    }
  }

  if (input.state === 'suspended' || input.state === 'rejected') {
    try {
      const res = await fetch('/api/admin/set-tenant-active', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: cleanEmail, active: false }),
      });
      const data = await res.json();
      if (data.success) steps.push('auth_disabled');
      else if (data.error?.includes('not-found')) warnings.push('لا يوجد حساب Auth لهذا البريد');
    } catch {
      warnings.push('تعذر تعطيل حساب Auth');
    }
  }

  return { companyId, steps, warnings };
}
