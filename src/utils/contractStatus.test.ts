import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeContractStatus } from './contractStatus.ts';

test('normalizeContractStatus converts mixed contract states to a single canonical format', () => {
  assert.equal(normalizeContractStatus('RUNNING'), 'running');
  assert.equal(normalizeContractStatus('ACTIVE'), 'running');
  assert.equal(normalizeContractStatus('running'), 'running');
  assert.equal(normalizeContractStatus('DRAFT'), 'draft');
  assert.equal(normalizeContractStatus('draft'), 'draft');
  assert.equal(normalizeContractStatus('EXPIRED'), 'expired');
  assert.equal(normalizeContractStatus('cancelled'), 'cancelled');
  assert.equal(normalizeContractStatus('ساري'), 'running');
  assert.equal(normalizeContractStatus('منتهي'), 'expired');
  assert.equal(normalizeContractStatus('مستقيل'), 'expired');
  assert.equal(normalizeContractStatus(undefined), 'draft');
});
