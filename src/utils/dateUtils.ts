/**
 * مساعدات معالجة التواريخ وحساب فترات انتهاء الوثائق الرسمية
 * يدعم جميع صيغ الإدخال (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, etc.)
 */

export function parseFlexibleDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  const str = String(dateInput).trim();
  if (!str) return null;

  // 1. تجربة التنسيق القياسي المباشر (ISO / YYYY-MM-DD)
  let parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // 2. تحليل الصيغ العربية/البريطانية (DD-MM-YYYY أو DD/MM/YYYY أو D-M-YYYY)
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // Month is 0-indexed in JS
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  // 3. تحليل صيغة (YYYY/MM/DD أو YYYY.MM.DD)
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

export interface DocumentExpiryStatus {
  hasDate: boolean;
  rawDate: string;
  parsedDate: Date | null;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // خلال 45 يوم
  badgeText: string;
  badgeClass: string;
  colorType: 'expired' | 'warning' | 'valid' | 'none';
}

export function checkDocumentExpiry(dateInput: any, label = 'الوثيقة'): DocumentExpiryStatus {
  if (!dateInput) {
    return {
      hasDate: false,
      rawDate: '',
      parsedDate: null,
      daysRemaining: 9999,
      isExpired: false,
      isExpiringSoon: false,
      badgeText: 'غير محدد',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      colorType: 'none',
    };
  }

  const parsed = parseFlexibleDate(dateInput);
  if (!parsed) {
    return {
      hasDate: false,
      rawDate: String(dateInput),
      parsedDate: null,
      daysRemaining: 9999,
      isExpired: false,
      isExpiringSoon: false,
      badgeText: String(dateInput),
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      colorType: 'none',
    };
  }

  const now = new Date();
  // تصفير الساعات لمقارنة الأيام بدقة
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfExp = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  
  const diffDays = Math.ceil((startOfExp - startOfToday) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0;
  const isExpiringSoon = diffDays >= 0 && diffDays <= 45;

  let badgeText = '';
  let badgeClass = '';
  let colorType: 'expired' | 'warning' | 'valid' | 'none' = 'valid';

  if (isExpired) {
    const daysPassed = Math.abs(diffDays);
    badgeText = daysPassed === 0 ? `منتهية اليوم ⚠️` : `منتهية منذ ${daysPassed} يوم ⚠️`;
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
    colorType = 'expired';
  } else if (isExpiringSoon) {
    badgeText = diffDays === 0 ? `تنتهي اليوم ⏰` : `تنتهي خلال ${diffDays} يوم ⏰`;
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    colorType = 'warning';
  } else {
    badgeText = `سارية (${diffDays} يوم)`;
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    colorType = 'valid';
  }

  return {
    hasDate: true,
    rawDate: String(dateInput),
    parsedDate: parsed,
    daysRemaining: diffDays,
    isExpired,
    isExpiringSoon,
    badgeText,
    badgeClass,
    colorType,
  };
}
