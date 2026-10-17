import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCAN_CREDENTIAL_HELP,
  collectAliasRows,
  formatScanTable,
  parseMigrateArgs,
  productionScanGate,
  type ScanCollection,
} from './companyIdAliasScan.ts';

test('scan refuses --apply and refuses a real project without --scan', () => {
  const mixed = parseMigrateArgs(['--scan', '--project', 'aysed-prod', '--apply']);
  assert.equal(mixed.ok, false);
  if (!mixed.ok) assert.match(mixed.error, /قراءة فقط/);

  const swapped = parseMigrateArgs(['--apply', '--scan', '--project=aysed-prod']);
  assert.equal(swapped.ok, false);

  const bare = parseMigrateArgs(['--project', 'aysed-prod']);
  assert.equal(bare.ok, false);
  if (!bare.ok) assert.match(bare.error, /لم يُفتح اتصال/);

  const scan = parseMigrateArgs(['--scan', '--project', 'aysed-prod']);
  assert.deepEqual(scan, { ok: true, mode: 'scan', projectId: 'aysed-prod' });

  const emulator = parseMigrateArgs(['--dry-run']);
  assert.deepEqual(emulator, { ok: true, mode: 'emulator', apply: false });
});

test('scan stops when credentials need a key file and does not include the secret', () => {
  const key = '{"type":"service_account","private_key":"SECRET-KEY-MATERIAL"}';
  const fromEnv = productionScanGate({
    env: { GOOGLE_APPLICATION_CREDENTIALS: 'C:/secrets/key.json' },
    adcText: '{"type":"authorized_user"}',
    adcFileExists: true,
  });
  assert.equal(fromEnv.ok, false);
  if (!fromEnv.ok) {
    assert.match(fromEnv.message, /gcloud auth application-default login/);
    assert.match(fromEnv.message, /datastore\.viewer/);
    assert.equal(fromEnv.message.includes('SECRET-KEY-MATERIAL'), false);
    assert.equal(fromEnv.message.includes('key.json'), false);
  }

  const fromFile = productionScanGate({
    env: {},
    adcText: key,
    adcFileExists: true,
  });
  assert.equal(fromFile.ok, false);
  if (!fromFile.ok) {
    assert.equal(fromFile.message, SCAN_CREDENTIAL_HELP);
    assert.equal(fromFile.message.includes('SECRET-KEY-MATERIAL'), false);
  }

  const user = productionScanGate({
    env: {},
    adcText: '{"type":"authorized_user","client_id":"hidden"}',
    adcFileExists: true,
  });
  assert.equal(user.ok, true);
});

test('scan table counts legacy company fields and example ids without writing', async () => {
  const employees: ScanCollection = {
    async get() {
      return {
        docs: [
          {
            id: 'e1',
            path: 'employees/e1',
            data: () => ({ companyId: 'comp-alfanar', company_id: 'comp-elite', name: 'أ' }),
            async collections() { return []; },
          },
          {
            id: 'e2',
            path: 'employees/e2',
            data: () => ({ companyId: 'comp-alfanar', activeCompanyId: 'comp-manar' }),
            async collections() { return []; },
          },
          {
            id: 'e3',
            path: 'employees/e3',
            data: () => ({ companyId: 'comp-1788442584841' }),
            async collections() { return []; },
          },
        ],
      };
    },
  };
  const rows = await collectAliasRows([employees]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].collection, 'employees');
  assert.equal(rows[0].documents, 3);
  assert.deepEqual(rows[0].examples, ['e1', 'e2']);
  const companyId = rows[0].aliases.find((alias) => alias.field === 'companyId' && alias.value === 'comp-alfanar');
  assert.equal(companyId?.count, 2);
  const table = formatScanTable(rows);
  assert.match(table, /المجموعة \| عدد المستندات \| القيم القديمة \| أمثلة معرّفات/);
  assert.match(table, /companyId: comp-alfanar ×2/);
  assert.match(table, /company_id: comp-elite ×1/);
  assert.match(table, /activeCompanyId: comp-manar ×1/);
  assert.match(table, /e1، e2/);
  assert.equal(table.includes('comp-1788442584841'), false);
});
