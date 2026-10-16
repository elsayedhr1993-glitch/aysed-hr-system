import { describe, expect, it } from 'vitest';
import { employeeRemovalMode } from './employeeRemoval';

describe('employeeRemovalMode', () => {
  it('archives when linked records exist and deletes only a file with none', () => {
    expect(employeeRemovalMode(1)).toBe('archive');
    expect(employeeRemovalMode(4)).toBe('archive');
    expect(employeeRemovalMode(0)).toBe('delete');
  });
});
