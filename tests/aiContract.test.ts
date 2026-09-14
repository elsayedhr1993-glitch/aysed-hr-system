import assert from 'node:assert/strict';
import { buildAiPayload, AI_MODELS } from '../src/config/aiConfig';

const payload = buildAiPayload({
  prompt: 'ما هي مكافأة نهاية الخدمة؟',
  contextSummary: 'شركة المنار كلينك',
  conversationHistory: [
    { role: 'user', content: 'مرحبا' },
    { role: 'assistant', content: 'مرحبا بك' },
  ],
});

assert.equal(payload.prompt, 'ما هي مكافأة نهاية الخدمة؟');
assert.equal(payload.contextSummary, 'شركة المنار كلينك');
assert.deepEqual(payload.conversationHistory, [
  { role: 'user', content: 'مرحبا' },
  { role: 'assistant', content: 'مرحبا بك' },
]);
assert.equal('messages' in payload, false);
assert.equal('userQuery' in payload, false);
assert.ok(AI_MODELS.chat.includes('gemini'));

console.log('AI contract test passed');
