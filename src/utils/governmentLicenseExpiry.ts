import type { LicenseDaysRemaining } from '../types/governmentLicense';

export function getLicenseDaysRemaining(expiryDate: string): LicenseDaysRemaining {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  if (Number.isNaN(exp.getTime())) {
    return { days: 0, status: 'warning', label: 'تاريخ غير صالح' };
  }
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { days, status: 'expired', label: 'منتهي' };
  }
  if (days <= 60) {
    return { days, status: 'warning', label: `ينتهي خلال ${days} يوم` };
  }
  return { days, status: 'valid', label: `ساري (${days} يوم)` };
}
