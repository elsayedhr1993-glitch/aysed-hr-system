import { describe, expect, it } from 'vitest';
import { outsideClickClosesWizard, visibleQuickTools } from './quickActionMenu';

describe('popup chrome', () => {
  it('hides payroll tools unless the server allows them', () => {
    const items = [
      { key: 'calc_eos' },
      { key: 'scanner' },
      { key: 'salary_certificate' },
    ];
    expect(visibleQuickTools(items, false).map((item) => item.key)).toEqual(['scanner']);
    expect(visibleQuickTools(items, true)).toHaveLength(3);
  });

  it('keeps the license wizard open when there are unsaved edits', () => {
    expect(outsideClickClosesWizard(true)).toBe(false);
    expect(outsideClickClosesWizard(false)).toBe(true);
  });
});
