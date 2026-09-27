import type { DocumentItem } from '../types';

const EMPLOYEE_DOCUMENT_CATEGORY_AR: Record<string, string> = {
  CIVIL_ID: 'البطاقة المدنية',
  PASSPORT: 'جواز السفر',
  DRIVING_LICENSE: 'رخصة القيادة',
  PROFESSIONAL_LICENSE: 'ترخيص مهني',
  WORK_CONTRACT: 'عقد العمل',
  MOH_LICENSE: 'ترخيص وزارة الصحة',
  COMPANY_DEED: 'عقد تأسيس',
  COMPANY_LICENSE: 'ترخيص المنشأة',
  CONTRACT: 'عقد',
  RESIDENCY: 'الإقامة',
  OTHER: 'وثيقة أخرى',
};

/** نوع الوثيقة فقط — بدون اسم الموظف (للطباعة والكانبان). */
export function employeeDocumentTypeLabel(
  doc: Pick<DocumentItem, 'title' | 'category'>
): string {
  const categoryKey = String(doc.category || '').trim().toUpperCase();
  if (categoryKey && EMPLOYEE_DOCUMENT_CATEGORY_AR[categoryKey]) {
    return EMPLOYEE_DOCUMENT_CATEGORY_AR[categoryKey];
  }

  const title = String(doc.title || '').trim();
  if (!title) return '—';

  const dashParts = title.split(/\s*[—–]\s*/);
  if (dashParts.length >= 2) {
    const head = dashParts[0].trim();
    if (head.length > 0 && head.length <= 48) return head;
  }

  return title;
}

/** شارة سريان مختصرة (أودو): ساري | منتهي */
export function validityBadgeLabelShort(isExpired: boolean): 'ساري' | 'منتهي' {
  return isExpired ? 'منتهي' : 'ساري';
}

export function validityBadgeLabelFromEmployeeStatus(
  status: 'active' | 'near_expiry' | 'expired'
): 'ساري' | 'منتهي' {
  return status === 'expired' ? 'منتهي' : 'ساري';
}
