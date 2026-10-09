import assert from 'node:assert/strict';
import { buildNavigateActionFromPrompt } from '../src/lib/aiCopilotNavigateParser.ts';
import { buildCopilotActionFromPrompt } from '../src/lib/aiCopilotActions.ts';

const leavesFinance = buildNavigateActionFromPrompt('افتح تطبيق الإجازات والمركز المالي');
assert.equal(leavesFinance?.type, 'NAVIGATE');
assert.equal(leavesFinance?.appId, 'leaves');
assert.equal(leavesFinance?.appTab, 'finance');

const calculator = buildCopilotActionFromPrompt('افتح حاسبة الموارد البشرية السريعة');
assert.equal(calculator?.type, 'OPEN_CALCULATOR');

console.log('aiCopilotNavigate.test.ts passed');
