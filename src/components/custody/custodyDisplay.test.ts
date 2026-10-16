import { describe, expect, it } from 'vitest';
import {
  custodySettlementDeduction,
  custodyTableStatus,
  undeliveredCustodyAlert,
} from './custodyDisplay';

describe('custody display', () => {
  it('keeps lifecycle status as the table column and condition as a separate hint', () => {
    const shown = custodyTableStatus({ status: 'ASSIGNED', condition: 'GOOD' });
    expect(shown.column).toBe('status');
    expect(shown.value).toBe('ASSIGNED');
    expect(shown.conditionHint).toBe('GOOD');
    expect(shown.value).not.toBe(shown.conditionHint);
  });

  it('alerts on undelivered custody and does not deduct it from the settlement', () => {
    expect(undeliveredCustodyAlert(2)).toBe('عهدة غير مسلّمة');
    expect(undeliveredCustodyAlert(0)).toBeNull();
    expect(custodySettlementDeduction()).toBe(0);
  });
});
