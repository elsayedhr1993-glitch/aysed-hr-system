// Odoo Enterprise Unified Palette & Color Tags Architecture
// Standard 8 Official Odoo Colors + Healthcare & Department System

export type OdooColorKey = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'red' 
  | 'slate' 
  | 'teal' 
  | 'yellow';

export interface OdooColorConfig {
  key: OdooColorKey;
  label: string;
  labelEn: string;
  hex: string;
  bgLight: string;
  bgBadge: string;
  textBadge: string;
  borderClass: string;
  folderBg: string;
  folderText: string;
  folderHover: string;
  ringClass: string;
  dotColor: string;
}

export const ODOO_PALETTE: Record<OdooColorKey, OdooColorConfig> = {
  blue: {
    key: 'blue',
    label: 'أزرق ملكي (Royal Blue)',
    labelEn: 'Royal Blue',
    hex: '#0284c7',
    bgLight: 'bg-sky-50',
    bgBadge: 'bg-sky-100',
    textBadge: 'text-sky-800',
    borderClass: 'border-sky-300',
    folderBg: 'bg-sky-50 text-sky-700 border-sky-200 hover:border-sky-400 hover:bg-sky-100/50',
    folderText: 'text-sky-700',
    folderHover: 'hover:border-sky-400',
    ringClass: 'ring-sky-500',
    dotColor: '#0284c7'
  },
  teal: {
    key: 'teal',
    label: 'تركواز طبي (Medical Teal)',
    labelEn: 'Medical Teal',
    hex: '#0d9488',
    bgLight: 'bg-teal-50',
    bgBadge: 'bg-teal-100',
    textBadge: 'text-teal-800',
    borderClass: 'border-teal-300',
    folderBg: 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400 hover:bg-teal-100/50',
    folderText: 'text-teal-700',
    folderHover: 'hover:border-teal-400',
    ringClass: 'ring-teal-500',
    dotColor: '#0d9488'
  },
  purple: {
    key: 'purple',
    label: 'بنفسجي Odoo (Amethyst)',
    labelEn: 'Odoo Amethyst',
    hex: '#714B67',
    bgLight: 'bg-purple-50',
    bgBadge: 'bg-[#714B67]/10',
    textBadge: 'text-[#714B67]',
    borderClass: 'border-[#714B67]/30',
    folderBg: 'bg-purple-50/70 text-[#714B67] border-purple-200 hover:border-[#714B67] hover:bg-purple-100/50',
    folderText: 'text-[#714B67]',
    folderHover: 'hover:border-[#714B67]',
    ringClass: 'ring-[#714B67]',
    dotColor: '#714B67'
  },
  green: {
    key: 'green',
    label: 'أخضر زمردي (Emerald)',
    labelEn: 'Emerald Green',
    hex: '#059669',
    bgLight: 'bg-emerald-50',
    bgBadge: 'bg-emerald-100',
    textBadge: 'text-emerald-800',
    borderClass: 'border-emerald-300',
    folderBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/50',
    folderText: 'text-emerald-700',
    folderHover: 'hover:border-emerald-400',
    ringClass: 'ring-emerald-500',
    dotColor: '#059669'
  },
  orange: {
    key: 'orange',
    label: 'برتقالي مشرق (Amber)',
    labelEn: 'Bright Orange',
    hex: '#ea580c',
    bgLight: 'bg-orange-50',
    bgBadge: 'bg-orange-100',
    textBadge: 'text-orange-800',
    borderClass: 'border-orange-300',
    folderBg: 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400 hover:bg-orange-100/50',
    folderText: 'text-orange-700',
    folderHover: 'hover:border-orange-400',
    ringClass: 'ring-orange-500',
    dotColor: '#ea580c'
  },
  red: {
    key: 'red',
    label: 'أحمر قرمزي (Crimson)',
    labelEn: 'Crimson Red',
    hex: '#e11d48',
    bgLight: 'bg-rose-50',
    bgBadge: 'bg-rose-100',
    textBadge: 'text-rose-800',
    borderClass: 'border-rose-300',
    folderBg: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400 hover:bg-rose-100/50',
    folderText: 'text-rose-700',
    folderHover: 'hover:border-rose-400',
    ringClass: 'ring-rose-500',
    dotColor: '#e11d48'
  },
  yellow: {
    key: 'yellow',
    label: 'أصفر كهرماني (Yellow)',
    labelEn: 'Amber Gold',
    hex: '#d97706',
    bgLight: 'bg-amber-50',
    bgBadge: 'bg-amber-100',
    textBadge: 'text-amber-800',
    borderClass: 'border-amber-300',
    folderBg: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50',
    folderText: 'text-amber-700',
    folderHover: 'hover:border-amber-400',
    ringClass: 'ring-amber-500',
    dotColor: '#d97706'
  },
  slate: {
    key: 'slate',
    label: 'رمادي وكحلي مساند (Slate)',
    labelEn: 'Support Slate',
    hex: '#475569',
    bgLight: 'bg-slate-50',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-800',
    borderClass: 'border-slate-300',
    folderBg: 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100/50',
    folderText: 'text-slate-700',
    folderHover: 'hover:border-slate-400',
    ringClass: 'ring-slate-500',
    dotColor: '#475569'
  }
};

export const ODOO_COLOR_KEYS: OdooColorKey[] = [
  'blue',
  'teal',
  'purple',
  'green',
  'orange',
  'red',
  'yellow',
  'slate'
];

/**
 * دالة تحديد نمط القسم والكوادر الوظيفية
 */
export interface DepartmentColorStyle {
  badgeBg: string;
  badgeText: string;
  border: string;
  icon: string;
  category: 'medical' | 'nursing' | 'hr' | 'security' | 'management' | 'other';
  label: string;
}

export const getDepartmentColorStyle = (departmentName?: string, jobTitle?: string): DepartmentColorStyle => {
  const text = `${departmentName || ''} ${jobTitle || ''}`.toLowerCase();

  // 1. القسم الطبي والأطباء (Medical Staff - Blue #0284c7)
  if (
    text.includes('طب') || 
    text.includes('طبيب') || 
    text.includes('أطباء') ||
    text.includes('اطباء') ||
    text.includes('دكتور') || 
    text.includes('dr') || 
    text.includes('استشاري') || 
    text.includes('جلدية') || 
    text.includes('طوارئ') ||
    text.includes('جراحة') ||
    text.includes('عياد')
  ) {
    return {
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
      badgeText: 'text-sky-800',
      border: 'border-sky-200',
      icon: '🩺',
      category: 'medical',
      label: 'الأطباء'
    };
  }

  // 2. التمريض والمختبرات (Nursing & Labs - Violet / Light Purple #7c3aed)
  if (
    text.includes('تمريض') || 
    text.includes('ممرض') || 
    text.includes('nurse') || 
    text.includes('مختبر') || 
    text.includes('تحاليل') || 
    text.includes('فني') ||
    text.includes('أشعة')
  ) {
    return {
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      badgeText: 'text-purple-800',
      border: 'border-purple-200',
      icon: '💉',
      category: 'nursing',
      label: 'التمريض'
    };
  }

  // 3. الموارد البشرية والإدارة (HR & Admin - Emerald #0f766e / #059669)
  if (
    text.includes('موارد') || 
    text.includes('hr') || 
    text.includes('إدار') || 
    text.includes('جوازات') || 
    text.includes('عاملين') || 
    text.includes('مالي') ||
    text.includes('محاسب')
  ) {
    return {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: '💼',
      category: 'hr',
      label: 'الموارد البشرية'
    };
  }

  // 4. الأمن والخدمات المساندة (Security & Support - Dark Slate #475569)
  if (
    text.includes('أمن') || 
    text.includes('حراسة') || 
    text.includes('خدمات') || 
    text.includes('سائق') || 
    text.includes('صيانة') || 
    text.includes('مخازن')
  ) {
    return {
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      badgeText: 'text-slate-800',
      border: 'border-slate-300',
      icon: '🛡️',
      category: 'security',
      label: 'الأمن والخدمات'
    };
  }

  // الافتراضي (الإدارة العامة)
  return {
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    border: 'border-slate-200',
    icon: '🏢',
    category: 'management',
    label: departmentName || 'عام'
  };
};

/**
 * دالة تلوين حالات المعاملات (مسودة، قيد الاعتماد، معتمد، ملغي/مرفوض)
 */
export interface WorkflowStatusBadge {
  text: string;
  bgClass: string;
  icon?: string;
  statusKey: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
}

export const getWorkflowStatusBadge = (status: string): WorkflowStatusBadge => {
  const s = status.toLowerCase();

  switch (s) {
    case 'draft':
    case 'مسودة':
      return {
        text: 'مسودة (Draft)',
        bgClass: 'bg-slate-100 text-slate-700 border border-slate-300',
        icon: '📝',
        statusKey: 'draft'
      };

    case 'pending':
    case 'قيد الاعتماد':
    case 'تحت المراجعة':
    case 'waiting':
      return {
        text: 'قيد الاعتماد (Pending)',
        bgClass: 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse',
        icon: '⏳',
        statusKey: 'pending'
      };

    case 'approved':
    case 'معتمد':
    case 'confirmed':
    case 'مؤكد':
    case 'active':
    case 'نشط':
    case 'valid':
    case 'سار':
      return {
        text: 'معتمد رسمياً (Approved)',
        bgClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        icon: '✅',
        statusKey: 'approved'
      };

    case 'paid':
    case 'مدفوع':
    case 'تم الصرف':
      return {
        text: 'تم الصرف والتحويل (Paid)',
        bgClass: 'bg-teal-100 text-teal-800 border border-teal-300',
        icon: '💳',
        statusKey: 'paid'
      };

    case 'rejected':
    case 'مرفوض':
    case 'cancelled':
    case 'ملغي':
    case 'expired':
    case 'منتهي':
      return {
        text: 'ملغي / مرفوض (Rejected)',
        bgClass: 'bg-rose-100 text-rose-800 border border-rose-300',
        icon: '❌',
        statusKey: 'rejected'
      };

    default:
      return {
        text: status,
        bgClass: 'bg-slate-100 text-slate-700 border border-slate-200',
        icon: '📌',
        statusKey: 'draft'
      };
  }
};
