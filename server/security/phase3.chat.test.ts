import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { classifyCopilotIntent, isToolIntent } from '../../src/lib/copilotIntentRouter';
import {
  __resetAuditLogForTests,
  __setAuditStoreForTests,
  type AuditEvent,
} from '../auditLog';
import { handleAiChatRequest } from '../aiChatCore';
import type { GeminiClient } from '../geminiServer';
import {
  assertChatSession,
  buildChatModelParts,
  redactModelText,
} from '../aiOutbound';

const SAMPLE = 'الرقم المدني 293080106877 والجواز P1234567 والراتب 450';

test('session identity, role, and company are required before a query', () => {
  assert.equal(assertChatSession({ role: 'HR_USER', companyId: 'comp-1' }).ok, false);
  assert.equal(assertChatSession({ uid: 'u1', role: 'UNKNOWN', companyId: 'comp-1' }).ok, false);
  assert.equal(assertChatSession({ uid: 'u1', role: 'HR_USER', companyId: '' }).ok, false);
  assert.equal(assertChatSession({ uid: 'u1', role: 'HR_USER', companyId: 'SAAS_PLATFORM' }).ok, false);
  const ok = assertChatSession({ uid: 'u1', role: 'EMPLOYEE', companyId: 'comp-1' });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.companyId, 'comp-1');
});

test('civil ids, passports, and salaries are masked for unauthorized roles', () => {
  const hidden = redactModelText(SAMPLE, 'EMPLOYEE');
  assert.equal(hidden.includes('293080106877'), false);
  assert.equal(hidden.includes('P1234567'), false);
  assert.equal(hidden.includes('450'), false);
  assert.match(hidden, /877/);
  assert.match(hidden, /•••/);

  const shown = redactModelText(SAMPLE, 'FINANCE');
  assert.equal(shown.includes('293080106877'), true);
  assert.equal(shown.includes('P1234567'), true);
  assert.equal(shown.includes('450'), true);
});

test('the model brief keeps a minimum and drops the raw screen and company id', () => {
  const parts = buildChatModelParts({
    role: 'EMPLOYEE',
    prompt: 'ما مدة الإجازة السنوية؟',
    contextSummary: 'معرّف الشركة: comp-secret\nالموظفون النشطون: 4',
    activeApp: 'employees',
    screenSummary: 'نموذج موظف',
    conversationHistory: [{ role: 'user', content: 'مرحبا' }],
  });
  const text = parts.map((part) => part.text).join('\n');
  assert.equal(text.includes('comp-secret'), false);
  assert.equal(text.includes('screen='), false);
  assert.match(text, /الموظفون النشطون: 4/);
  assert.match(text, /ما مدة الإجازة السنوية/);
});

test('chat route files exclude the SPA rewrite and avoid import.meta', () => {
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as {
    rewrites: { source: string; destination: string }[];
    functions: Record<string, unknown>;
  };
  assert.ok(vercel.functions['api/chat.ts']);
  for (const rule of vercel.rewrites) {
    if (rule.destination === '/index.html') {
      assert.match(rule.source, /\(\?!api\/\)/);
    }
  }
  assert.equal(fs.existsSync('api/chat.ts'), true);
  assert.match(fs.readFileSync('api/chat.ts', 'utf8'), /export default function handler/);
  assert.doesNotMatch(fs.readFileSync('src/config/aiConfig.ts', 'utf8'), /import\.meta/);
  assert.match(fs.readFileSync('src/components/AysedAICopilot.tsx', 'utf8'), /\/api\/chat/);
  assert.match(fs.readFileSync('src/hooks/useAiAssistantRequest.ts', 'utf8'), /\/api\/chat/);
});

test('a mocked chat records the question and does not send secrets to the model', async () => {
  const prompt = 'ما مدة الإجازة السنوية؟ الرقم 293080106877 والراتب 450';
  const intent = classifyCopilotIntent(prompt, 'chat');
  assert.equal(isToolIntent(intent), false);

  const events: AuditEvent[] = [];
  __resetAuditLogForTests();
  __setAuditStoreForTests({
    async append(event) {
      events.push(event);
    },
    async listAll() {
      return events;
    },
  });

  const calls: string[] = [];
  const fake = {
    models: {
      async generateContent(req: { contents: { parts: { text: string }[] } }) {
        calls.push(req.contents.parts.map((part) => part.text).join('\n'));
        return { text: JSON.stringify({ reply: 'الإجازة السنوية ثلاثون يوماً.', action: null }) };
      },
    },
  } as unknown as GeminiClient;

  const result = await handleAiChatRequest(
    {
      prompt,
      companyId: 'forged-company',
      contextSummary: 'معرّف الشركة: comp-session\nمتوسط الراتب الشامل: 450.000 KWD',
      screen: { civilId: '293080106877', secret: 'should-not-send' },
    },
    'Bearer ' + 't'.repeat(24),
    () => fake,
    {
      requireAuth: async () => ({
        ok: true,
        token: 't'.repeat(24),
        uid: 'user-1',
        email: 'employee@example.com',
        claims: {},
        status: 200,
      }),
      resolveRole: async () => ({ role: 'EMPLOYEE', companyId: 'comp-session' }),
    }
  );

  assert.equal(result.status, 403);
  assert.equal(calls.length, 0);
  assert.equal(events.length, 0);
  assert.match(String(result.body.error), /منشأة/);

  const allowed = await handleAiChatRequest(
    {
      prompt,
      companyId: 'comp-session',
      contextSummary: 'معرّف الشركة: comp-session\nمتوسط الراتب الشامل: 450.000 KWD',
      screen: { secret: 'should-not-send' },
    },
    'Bearer ' + 't'.repeat(24),
    () => fake,
    {
      requireAuth: async () => ({
        ok: true,
        token: 't'.repeat(24),
        uid: 'user-1',
        email: 'employee@example.com',
        claims: {},
        status: 200,
      }),
      resolveRole: async () => ({ role: 'EMPLOYEE', companyId: 'comp-session' }),
      ip: '127.0.0.1',
    }
  );

  assert.equal(allowed.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].includes('293080106877'), false);
  assert.equal(calls[0].includes('comp-session'), false);
  assert.equal(calls[0].includes('should-not-send'), false);
  assert.equal(calls[0].includes('450'), false);
  assert.equal(events.length, 1);
  assert.equal(events[0].action, 'ai_query');
  assert.equal(events[0].companyId, 'comp-session');
  assert.equal(events[0].details.includes('293080106877'), false);
  assert.equal(String(allowed.body.error || ''), '');
  assert.doesNotMatch(String(allowed.body.reply), /Gemini|Firebase|Vercel/);

  __setAuditStoreForTests(null);
  __resetAuditLogForTests();
});
