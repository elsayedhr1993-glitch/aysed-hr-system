// تعريف نوع البيانات لتراخيص ومستندات المنشأة
export interface CompanyDocument {
  id: string;
  name: string; // اسم الترخيص
  /** مسمى نوع الترخيص (نص حر أو مفتاح legacy مثل commercial_license) */
  documentType: string;
  documentNumber: string; // رقم الترخيص / القيد
  issuingAuthority: string; // جهة الإصدار (وزارة التجارة، البلدية، الصحة، المطافئ...)
  issueDate: string; // تاريخ الإصدار YYYY-MM-DD
  expiryDate: string; // تاريخ الانتهاء YYYY-MM-DD
  /** @deprecated لم يعد يُستخدم في النموذج — قد يظهر في سجلات قديمة فقط */
  responsiblePerson?: string;
  fileUrl?: string; // رابط ملف الـ PDF أو الصورة
  notes?: string;
  companyId?: string;
}

export const COMPANY_DOCUMENT_TYPE_LABELS: Record<string, string> = {
  commercial_license: 'رخصة تجارية',
  signature_auth: 'اعتماد توقيع',
  chamber_commerce: 'عضوية غرفة التجارة',
  municipality: 'رخصة بلدية',
  civil_defense: 'دفاع مدني',
  medical_license: 'ترخيص صحي/طبي',
  lease_contract: 'عقد إيجار',
  other: 'أخرى',
};

export const COMPANY_DOCUMENT_TYPE_SUGGESTIONS: string[] = [
  ...Object.values(COMPANY_DOCUMENT_TYPE_LABELS),
  'ترخيص وزارة الصحة',
  'شهادة عضوية',
  'تصريح تشغيل',
];

export function formatCompanyDocumentType(documentType: string): string {
  const key = String(documentType || '').trim();
  if (!key) return '—';
  return COMPANY_DOCUMENT_TYPE_LABELS[key] || key;
}

/** تواريخ انتهاء بعيدة جداً (مثل 2099) تُعرض كسريان دائم في التقارير */
export function formatCompanyDocumentExpiryDisplay(expiryDateStr?: string | null): string {
  const raw = String(expiryDateStr || '').trim();
  if (!raw || raw === '—') return 'غير محدد';
  const year = parseInt(raw.slice(0, 4), 10);
  if (!Number.isFinite(year)) return raw;
  if (year >= 2090) return 'دائم';
  return raw;
}

/** سطر واحد للطباعة: الاسم مع تصنيف النوع فقط إن كان مختلفاً */
export function companyDocumentPrintTitle(name: string, documentType: string): {
  primary: string;
  secondary?: string;
} {
  const primary = String(name || '').trim() || '—';
  const typeLabel = formatCompanyDocumentType(documentType);
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!typeLabel || typeLabel === '—' || norm(typeLabel) === norm(primary)) {
    return { primary };
  }
  return { primary, secondary: typeLabel };
}

export type DocumentValidityStatus = 'valid' | 'expiring_soon' | 'expired';

export type GetDocumentStatusOptions = {
  /** شارة مختصرة للكانبان والطباعة: ساري | منتهي */
  compactLabel?: boolean;
};

/** شارة سريان مختصرة (أودو) */
export function validityLabelShort(status: DocumentValidityStatus): 'ساري' | 'منتهي' {
  return status === 'expired' ? 'منتهي' : 'ساري';
}

// دالة حساب الحالة والتنبيهات بأسلوب Odoo (Computed Status)
export function getDocumentStatus(
  expiryDateStr: string,
  options?: GetDocumentStatusOptions
): {
  status: DocumentValidityStatus;
  daysRemaining: number;
  badgeColor: string;
  badgeLabel: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(expiryDateStr);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: DocumentValidityStatus;
  let badgeColor: string;

  if (daysRemaining < 0) {
    status = 'expired';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (daysRemaining <= 60) {
    status = 'expiring_soon';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else {
    status = 'valid';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }

  const compact = options?.compactLabel === true;
  const badgeLabel = compact
    ? validityLabelShort(status)
    : status === 'expired'
      ? `منتهي منذ ${Math.abs(daysRemaining)} يوم`
      : status === 'expiring_soon'
        ? `ينتهي خلال ${daysRemaining} يوم`
        : 'ساري المفعول';

  return { status, daysRemaining, badgeColor, badgeLabel };
}

export interface CompanyDocumentAlert {
  id: string;
  name: string;
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  isExpired: boolean;
  status: 'expiring_soon' | 'expired';
}

/** تراخيص المنشأة التي انتهت أو تنتهي خلال نافذة التنبيه (افتراضي 60 يوماً — مطابق لـ Kanban). */
export function collectCompanyDocumentAlerts(
  documents: CompanyDocument[],
  companyId?: string,
  alertWithinDays = 60
): CompanyDocumentAlert[] {
  const tenantId = String(companyId || '').trim();
  const alerts: CompanyDocumentAlert[] = [];

  for (const doc of documents) {
    if (tenantId) {
      const docCo = String(doc.companyId || tenantId).trim();
      if (docCo && docCo !== tenantId) continue;
    }
    if (!doc.expiryDate) continue;

    const { status, daysRemaining } = getDocumentStatus(doc.expiryDate);
    if (status === 'valid' && daysRemaining > alertWithinDays) continue;

    alerts.push({
      id: doc.id,
      name: doc.name,
      documentType: doc.documentType,
      expiryDate: doc.expiryDate,
      daysRemaining,
      isExpired: status === 'expired',
      status: status === 'expired' ? 'expired' : 'expiring_soon',
    });
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
