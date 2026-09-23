import { describe, expect, it } from 'vitest';
import {
  buildEmployeeRequiredDocumentChecklist,
  computeCompanyDocumentComplianceStats,
  computeEmployeeDocumentCompliance,
} from './employeeDocumentCompliance';

describe('employeeDocumentCompliance', () => {
  it('requires MOH license for medical departments only', () => {
    const hr = buildEmployeeRequiredDocumentChecklist({ dept: 'الموارد البشرية' });
    const nurse = buildEmployeeRequiredDocumentChecklist({ department: 'التمريض' });
    expect(hr.mohLicense).toBe(false);
    expect(nurse.mohLicense).toBe(true);
  });

  it('does not count employee as compliant when mandatory files are missing', () => {
    const emp = {
      dept: 'الموارد البشرية',
      civilIdExpiry: '2030-01-01',
      passportExpiry: '2030-01-01',
      documentFiles: {
        civilIdScan: { name: 'civil.pdf', url: 'https://example.com/civil.pdf' },
      },
    };
    const breakdown = computeEmployeeDocumentCompliance(emp);
    expect(breakdown.fulfilled).toBe(1);
    expect(breakdown.total).toBe(5);
    expect(breakdown.percentage).toBeLessThan(100);
    expect(breakdown.missingKeys).toContain('passportScan');
    expect(breakdown.missingKeys).toContain('signedContract');
  });

  it('aggregates company compliance from mandatory slots, not expiry-only heuristics', () => {
    const employees = [
      {
        dept: 'الموارد البشرية',
        documentFiles: {
          civilIdScan: { url: 'a' },
          passportScan: { url: 'b' },
          pamWorkPermit: { url: 'c' },
          medicalFitness: { url: 'd' },
          signedContract: { url: 'e' },
        },
        civilIdExpiry: '2030-01-01',
        passportExpiry: '2030-01-01',
      },
      {
        dept: 'الموارد البشرية',
        civilIdExpiry: '2030-01-01',
        passportExpiry: '2030-01-01',
      },
    ];
    const stats = computeCompanyDocumentComplianceStats(employees);
    expect(stats.total).toBe(10);
    expect(stats.fulfilled).toBe(5);
    expect(stats.percentage).toBe(50);
  });
});
