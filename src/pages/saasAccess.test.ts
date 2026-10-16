import { describe, expect, it } from 'vitest';
import { archiveConfirmReady, manarClinicRows, platformOwnerFromRole } from './saasAccess';

describe('saas access', () => {
  it('allows the platform owner only', () => {
    expect(platformOwnerFromRole('SUPER_ADMIN')).toBe(true);
    expect(platformOwnerFromRole('COMPANY_ADMIN')).toBe(false);
  });

  it('does not treat two different Manar names as one exact duplicate', () => {
    const rows = manarClinicRows([
      { id: 'comp-1788442584841', name: 'المنار كلينك' },
      { id: 'other', name: 'مستوصف المنار كلينك' },
    ]);
    expect(rows.exactCount).toBe(1);
    expect(rows.relatedCount).toBe(2);
    expect(rows.duplicateExact).toBe(false);
  });

  it('archives only when the typed facility name matches', () => {
    expect(archiveConfirmReady('المنار كلينك', 'المنار كلينك')).toBe(true);
    expect(archiveConfirmReady('حذف', 'المنار كلينك')).toBe(false);
  });
});
