export type CanonicalContractStatus = 'draft' | 'running' | 'expired' | 'cancelled';

const statusMap: Record<string, CanonicalContractStatus> = {
  draft: 'draft',
  'draft ': 'draft',
  running: 'running',
  active: 'running',
  'active ': 'running',
  'ساري': 'running',
  'سار': 'running',
  expired: 'expired',
  ended: 'expired',
  'منتهي': 'expired',
  'مستقيل': 'expired',
  resigned: 'expired',
  terminated: 'expired',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  'ملغي': 'cancelled',
  'مرفوض': 'cancelled',
};

export function normalizeContractStatus(status?: string | null): CanonicalContractStatus {
  if (status === undefined || status === null || status === '') return 'draft';

  const normalized = String(status).trim().toLowerCase();
  if (statusMap[normalized]) return statusMap[normalized];

  if (normalized.includes('running') || normalized.includes('active') || normalized.includes('ساري') || normalized.includes('سار')) {
    return 'running';
  }

  if (normalized.includes('draft') || normalized.includes('مسودة')) {
    return 'draft';
  }

  if (
    normalized.includes('expired') ||
    normalized.includes('ended') ||
    normalized.includes('منتهي') ||
    normalized.includes('مستقيل') ||
    normalized.includes('terminated') ||
    normalized.includes('resigned')
  ) {
    return 'expired';
  }

  if (normalized.includes('cancel') || normalized.includes('cancelled') || normalized.includes('ملغي') || normalized.includes('مرفوض')) {
    return 'cancelled';
  }

  return 'draft';
}
