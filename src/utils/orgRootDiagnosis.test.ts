import { describe, expect, it } from 'vitest';
import { diagnoseOrgRoots } from './orgRootDiagnosis';

describe('org root diagnosis', () => {
  it('treats an empty direct-manager field as a root and does not invent a manager', () => {
    const people = Array.from({ length: 24 }, (_, index) => ({
      id: `e${index}`,
      fullNameAr: `موظف ${index}`,
      department: 'التمريض',
      jobTitle: 'ممرض',
    }));
    const result = diagnoseOrgRoots(people);
    expect(result.employees).toBe(24);
    expect(result.roots).toBe(24);
    expect(result.emptyManager).toBe(24);
    expect(result.managerFieldEmpty).toBe(true);
    expect(people.every((person) => !('parentId' in person))).toBe(true);
  });

  it('is not all roots when a manager id is present', () => {
    const result = diagnoseOrgRoots([
      { id: 'a', fullNameAr: 'مدير', jobTitle: 'مدير' },
      { id: 'b', fullNameAr: 'موظف', parentId: 'a', jobTitle: 'محاسب' },
    ]);
    expect(result.roots).toBe(1);
    expect(result.managerFieldEmpty).toBe(false);
  });
});
