import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, companyCollectionWriteName, db, getCompaniesCollectionName, provisionTenantAuth } from '../lib/firebase';
import { loadCompanySettings, saveCompanySettings } from './companySettingsStorage';
import {
  listPlatformSubscriptionRequests,
  updatePlatformSubscriptionRequest,
  upsertPlatformFacilityUsers,
} from './platformOwnerApi';

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
    const rows = await listPlatformSubscriptionRequests();
    const fromReq = rows.find((row) => row.id === rowId)?.companyId;
    if (typeof fromReq === 'string' && isCompanyDocId(fromReq)) return fromReq;
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

export async function syncTenantSubscriptionEdit(
  input: TenantSubscriptionEditInput,
  deps: { getAuthedHeaders: () => Promise<Record<string, string>> }
): Promise<TenantSyncResult> {
  const steps: string[] = [];
  const warnings: string[] = [];

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

  const companyWrite = companyCollectionWriteName();
  if (companyWrite) {
    await setDoc(doc(db, companyWrite, companyId), companyPayload, { merge: true });
    steps.push('companies');
  }

  await updatePlatformSubscriptionRequest({
    rowId: input.rowId,
    companyId,
    companyName: input.companyName.trim(),
    requesterName: input.requesterName.trim(),
    phone: input.phone.trim(),
    email: cleanEmail,
    planType: input.planType,
    empCount: input.empCount,
    state: input.state,
  });
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

  const usersUpdated = await upsertPlatformFacilityUsers({
    companyId,
    email: cleanEmail,
    previousEmails: [previousEmail, cleanEmail],
    displayName: input.requesterName.trim(),
    companyName: input.companyName.trim(),
    isActive,
    status: companyStatus,
  });
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
        await upsertPlatformFacilityUsers({
          companyId,
          uid: authResult.uid,
          email: cleanEmail,
          displayName: input.requesterName.trim(),
          companyName: input.companyName.trim(),
          isActive: true,
          status: 'active',
        });
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
