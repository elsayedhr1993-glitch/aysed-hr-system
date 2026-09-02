export interface ExpiryStatusResult {
  status: 'green' | 'yellow' | 'red';
  days: number;
  text: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  badgeClass: string;
}

export const getExpiryStatus = (expiryDateString: string | undefined): ExpiryStatusResult | null => {
  if (!expiryDateString) return null;
  const expiryDate = new Date(expiryDateString);
  if (isNaN(expiryDate.getTime())) return null;

  const today = new Date();
  
  // Set both to midnight for accurate days calculation
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      status: 'red', 
      days: Math.abs(diffDays), 
      text: `منتهي الصلاحية (منذ ${Math.abs(diffDays)} يوم)`,
      isExpired: true,
      isExpiringSoon: false,
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200'
    };
  } else if (diffDays === 0) {
    return { 
      status: 'red', 
      days: 0, 
      text: 'ينتهي اليوم (متأخر اليوم)',
      isExpired: true,
      isExpiringSoon: false,
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
    };
  } else if (diffDays <= 60) {
    return { 
      status: 'yellow', 
      days: diffDays, 
      text: `يستحق قريباً (${diffDays} يوم)`,
      isExpired: false,
      isExpiringSoon: true,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  } else {
    return { 
      status: 'green', 
      days: diffDays, 
      text: `سارٍ (${diffDays} يوم متبقي)`,
      isExpired: false,
      isExpiringSoon: false,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
  }
};

export type OdooActivityTypeKey = 'doc_renewal' | 'moh_license' | 'contract_review';

export interface ActivityTypeConfig {
  key: OdooActivityTypeKey;
  label: string;
  icon: string;
  defaultAssignee: string;
  defaultAssigneeRole: string;
  description: string;
}

export const ODOO_ACTIVITY_TYPES: Record<OdooActivityTypeKey, ActivityTypeConfig> = {
  doc_renewal: {
    key: 'doc_renewal',
    label: '📅 تجديد مستند (Document Renewal)',
    icon: 'Calendar',
    defaultAssignee: 'يوسف العلي',
    defaultAssigneeRole: 'مسؤول الجوازات والإقامات',
    description: 'تجديد الإقامة، البطاقة المدنية، جواز السفر، أو الرخص الحكومية'
  },
  moh_license: {
    key: 'moh_license',
    label: '🩺 تجديد ترخيص طبي (MOH License)',
    icon: 'Stethoscope',
    defaultAssignee: 'أحمد الكندري',
    defaultAssigneeRole: 'مدير الموارد البشرية',
    description: 'تجديد ترخيص مزاولة المهنة الطبية أو تراخيص المنشأة من وزارة الصحة'
  },
  contract_review: {
    key: 'contract_review',
    label: '📝 متابعة عقد (Contract Review)',
    icon: 'FileText',
    defaultAssignee: 'محمد إبراهيم السيد',
    defaultAssigneeRole: 'مسؤول شؤون العاملين',
    description: 'مراجعة وتجديد عقود العمل، فترات التجربة، ومسودات العقود'
  }
};

