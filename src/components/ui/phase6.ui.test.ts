import { describe, expect, it } from 'vitest';
import { canRevealIdentity } from '../../security/accessRoles';
import { shownIdentity } from '../../security/identityMask';
import { tokens } from '../../design/tokens';
import {
  STATUS_TONES,
  formatMoneyOrDash,
  formatTableNumber,
  selectColumns,
  statusToneColor,
} from './phase6Logic';

describe('MaskedValue', () => {
  it('keeps a partial mask for civil id and passport unless HR or finance reveals it', () => {
    const civil = shownIdentity('200000000001', 'civil', 'EMPLOYEE', true);
    const passport = shownIdentity('P0000001', 'passport', 'HR_USER', true);
    expect(canRevealIdentity('EMPLOYEE')).toBe(false);
    expect(canRevealIdentity('HR_USER')).toBe(false);
    expect(civil.endsWith('001')).toBe(true);
    expect(civil).not.toContain('200000000');
    expect(passport.endsWith('01')).toBe(true);
    expect(passport).not.toBe('P0000001');
    expect(shownIdentity('200000000001', 'civil', 'HR_MANAGER', false)).not.toBe('200000000001');
    expect(shownIdentity('200000000001', 'civil', 'HR_MANAGER', true)).toBe('200000000001');
    expect(shownIdentity('P0000001', 'passport', 'FINANCE', true)).toBe('P0000001');
  });
});

describe('StatusBadge', () => {
  it('uses only the three status token colors', () => {
    expect(STATUS_TONES).toEqual(['success', 'warning', 'danger']);
    expect(statusToneColor('success')).toBe('var(--color-success)');
    expect(statusToneColor('warning')).toBe('var(--color-warning)');
    expect(statusToneColor('danger')).toBe('var(--color-danger)');
    expect(tokens.color.success).toBe('#059669');
    expect(tokens.color.warning).toBe('#D97706');
    expect(tokens.color.danger).toBe('#E11D48');
  });
});

describe('DataTable', () => {
  it('hides only hideable columns and renders zero as a dash', () => {
    const columns = [
      { id: 'name', hideable: false },
      { id: 'dept', hideable: true },
      { id: 'amount', hideable: true },
    ];
    expect(selectColumns(columns, new Set(['dept', 'name'])).map((column) => column.id)).toEqual(['name', 'amount']);
    expect(formatTableNumber(0)).toBe('—');
    expect(formatTableNumber(15)).toBe('15');
    expect(formatMoneyOrDash(0)).toBe('—');
    expect(formatMoneyOrDash(10.5)).toBe('10.500 د.ك');
  });
});
