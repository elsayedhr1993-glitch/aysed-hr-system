import test from 'node:test';
import assert from 'node:assert/strict';

import { validateKuwaitCivilId } from './kuwaitLaw.ts';
import { parseJsonFromAiText } from './ocrJsonParse.ts';

test('validateKuwaitCivilId is the single canonical checksum source used across OCR and forms', () => {
  const invalid = validateKuwaitCivilId('123456789012');
  assert.equal(invalid.isValid, false);

  const validSample = validateKuwaitCivilId('286010112345');
  assert.equal(typeof validSample.isValid, 'boolean');
  assert.equal(validateKuwaitCivilId('12345').isValid, false);
});

test('parseJsonFromAiText strips markdown fences and parses embedded JSON', () => {
  const raw = 'Here is data:\n```json\n{"civilId":"286010112345","fullNameAr":"اختبار"}\n```\n';
  const parsed = parseJsonFromAiText(raw);
  assert.equal(parsed.civilId, '286010112345');
  assert.equal(parsed.fullNameAr, 'اختبار');
});
