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

// دالة حساب الحالة والتنبيهات بأسلوب Odoo (Computed Status)
export function getDocumentStatus(expiryDateStr: string): {
  status: 'valid' | 'expiring_soon' | 'expired';
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

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      daysRemaining,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeLabel: `منتهي منذ ${Math.abs(daysRemaining)} يوم`
    };
  } else if (daysRemaining <= 60) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeLabel: `ينتهي خلال ${daysRemaining} يوم`
    };
  } else {
    return {
      status: 'valid',
      daysRemaining,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeLabel: 'ساري المفعول'
    };
  }
}
