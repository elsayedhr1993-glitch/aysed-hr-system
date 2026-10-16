import { describe, expect, it } from 'vitest';
import { canSaveScan } from './scannerFlow';

describe('scanner save gate', () => {
  it('refuses to save before an explicit approval on the last step', () => {
    expect(canSaveScan('type', false)).toBe(false);
    expect(canSaveScan('upload', false)).toBe(false);
    expect(canSaveScan('review', false)).toBe(false);
    expect(canSaveScan('review', true)).toBe(false);
    expect(canSaveScan('save', false)).toBe(false);
    expect(canSaveScan('save', true)).toBe(true);
  });
});
