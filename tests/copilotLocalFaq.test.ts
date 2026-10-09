import assert from 'node:assert/strict';
import {
  computeCopilotEmployeeStats,
  parseEmployeeStatsFromContextSummary,
  tryLocalFaqAnswer,
} from '../src/lib/copilotLocalFaq.ts';

const summary = `معرّف الشركة: comp-1788435917695
الاسم: إيليت كلينك
الموظفون النشطون: 28 (إجمالي السجلات: 29)`;

const parsed = parseEmployeeStatsFromContextSummary(summary);
assert.equal(parsed?.active, 28);
assert.equal(parsed?.total, 29);

const reply = tryLocalFaqAnswer('كم موظف عندي؟', parsed, true);
assert.ok(reply?.includes('28'));
assert.ok(reply?.includes('29'));

const stats = computeCopilotEmployeeStats(
  [
    { id: '1', status: 'ACTIVE' } as any,
    { id: '2', status: 'TERMINATED' } as any,
  ],
  'إيليت'
);
assert.equal(stats.active, 1);
assert.equal(stats.total, 2);

console.log('copilotLocalFaq.test.ts passed');
