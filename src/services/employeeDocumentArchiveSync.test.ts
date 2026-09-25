import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmployeeArchiveDocuments } from './employeeDocumentArchiveSync.ts';

test('buildEmployeeArchiveDocuments creates civil, residency, and PAM contract rows', () => {
  const rows = buildEmployeeArchiveDocuments({
    id: 'emp-1',
    companyId: 'comp-test',
    nameAr: 'أحمد علي',
    civilId: '285010101234',
    civilIdExpiry: '2027-06-01',
    residencyExpiry: '2026-12-15',
    contractEndDate: '2028-01-01',
    workPermitNo: 'PAM-99',
  });

  assert.equal(rows.length, 3);
  const keys = rows.map(r => r.sourceDocKey).sort();
  assert.deepEqual(keys, ['civilIdScan', 'residency', 'signedContract']);
  assert.equal(rows.find(r => r.sourceDocKey === 'civilIdScan')?.category, 'CIVIL_ID');
  assert.equal(rows.find(r => r.sourceDocKey === 'residency')?.expiryDate, '2026-12-15');
  assert.equal(rows.find(r => r.sourceDocKey === 'signedContract')?.category, 'WORK_CONTRACT');
});
