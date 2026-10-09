import assert from 'node:assert/strict';
import {
  classifyCopilotIntent,
  extractComplianceToolContext,
  isToolIntent,
  wantsComplianceSemantic,
} from '../src/lib/copilotIntentRouter';

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}`);
    throw e;
  }
}

test('L0 navigate leaves finance', () => {
  const intent = classifyCopilotIntent('افتح تطبيق الإجازات والمركز المالي', 'chat');
  assert.equal(intent.tier, 'L0');
  if (intent.tier === 'L0') {
    assert.equal(intent.action.type, 'NAVIGATE');
    assert.equal(intent.action.appId, 'leaves');
  }
});

test('L1 employee stats', () => {
  const intent = classifyCopilotIntent('كم موظف عندي', 'chat');
  assert.equal(intent.tier, 'L1');
  assert.ok(isToolIntent(intent));
  if (isToolIntent(intent)) assert.equal(intent.toolId, 'tenant.employeeStats');
});

test('L1 running contracts', () => {
  const intent = classifyCopilotIntent('كم عقد ساري', 'chat');
  assert.equal(intent.tier, 'L1');
  if (isToolIntent(intent)) assert.equal(intent.toolId, 'tenant.employeeStats');
});

test('L2 compliance gaps explicit list', () => {
  const intent = classifyCopilotIntent('اعرض قائمة وثائق منتهية', 'chat');
  assert.equal(intent.tier, 'L2');
  if (isToolIntent(intent)) assert.equal(intent.toolId, 'compliance.documentGaps');
});

test('L2 semantic: employee file gaps question', () => {
  const q = 'هل يوجد نواقص في ملفات الموظفين؟';
  assert.ok(wantsComplianceSemantic(q));
  const intent = classifyCopilotIntent(q, 'chat');
  assert.equal(intent.tier, 'L2');
});

test('L2 extracts employee name hint', () => {
  const ctx = extractComplianceToolContext('اعرض نواقص ملف كريم بخش');
  assert.ok(ctx.employeeNameHint?.includes('كريم'));
});

test('L3 open question without compliance roots', () => {
  const intent = classifyCopilotIntent('ما رأيك في سياسة العمل عن بعد', 'chat');
  assert.equal(intent.tier, 'L3');
});

console.log('copilotIntentRouter tests passed');
