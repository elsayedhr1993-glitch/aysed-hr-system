import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  launcherTileAllowed,
  launcherTileShown,
  resolveLauncherTile,
} from '../../src/config/launcherTiles';
import {
  __resetAuditLogForTests,
  __setAuditStoreForTests,
  type AuditEvent,
} from '../auditLog';
import {
  __resetStudioStoreForTests,
  resetStudioOverride,
  saveStudioOverrides,
  studioPersistenceMode,
} from '../studioOverrides';

const events: AuditEvent[] = [];

function resetStores(): void {
  events.length = 0;
  __resetAuditLogForTests();
  __setAuditStoreForTests({
    async append(event) {
      events.push(event);
    },
    async listAll() {
      return events.map((event) => ({ ...event }));
    },
  });
  __resetStudioStoreForTests();
}

test('hiding a tile does not grant or revoke the code permission', () => {
  assert.equal(launcherTileAllowed('EMPLOYEE', 'PAYROLL'), false);
  assert.equal(launcherTileAllowed('EMPLOYEE', 'ATTENDANCE'), true);
  assert.equal(launcherTileShown('EMPLOYEE', 'PAYROLL', { hidden: false, permission: 'employee' }), false);
  assert.equal(launcherTileAllowed('EMPLOYEE', 'ATTENDANCE'), true);
  assert.equal(launcherTileShown('EMPLOYEE', 'ATTENDANCE', { hidden: true }), false);
  const resolved = resolveLauncherTile('PAYROLL', { permission: 'employee', hidden: true, label: { ar: 'سري' } });
  assert.equal(resolved?.permission, 'staff');
  assert.equal(resolved?.storedPermission, 'employee');
  assert.equal(resolved?.hidden, true);
  assert.equal(resolved?.titleAr, 'سري');
});

test('only the system admin can save, and the company comes from the server', async () => {
  resetStores();
  assert.equal(studioPersistenceMode({}), 'memory');
  const denied = await saveStudioOverrides({
    role: 'COMPANY_ADMIN',
    uid: 'admin-1',
    email: 'hr@clinic.test',
    sessionCompanyId: 'comp-session',
    patches: { 'launcher.app.PAYROLL': { hidden: true } },
  });
  assert.equal(denied.status, 403);
  assert.equal(events.length, 0);

  const saved = await saveStudioOverrides({
    role: 'SUPER_ADMIN',
    uid: 'owner-1',
    email: 'owner@aysed.test',
    sessionCompanyId: 'comp-home',
    impersonatedCompanyId: 'comp-facility',
    patches: {
      'launcher.app.PAYROLL': {
        label: { ar: 'الأجور', en: 'Wages' },
        icon: 'Banknote',
        group: 'people',
        order: 15,
        hidden: true,
        permission: 'employee',
        companyId: 'forged-company',
      },
    },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.companyId, 'comp-facility');
  const document = saved.body.document as { elements: Record<string, { hidden?: boolean; group?: string }> };
  assert.equal(document.elements['launcher.app.PAYROLL'].hidden, true);
  assert.equal(document.elements['launcher.app.PAYROLL'].group, 'people');
  assert.equal(events.length, 1);
  assert.equal(events[0].userId, 'owner-1');
  assert.equal(events[0].userName, 'owner@aysed.test');
  assert.equal(events[0].action, 'customization');
  assert.equal(events[0].companyId, 'comp-facility');
  assert.equal(events[0].before?.titleAr, 'الرواتب وحماية الأجور');
  assert.equal(events[0].before?.hidden, false);
  assert.equal(events[0].after?.titleAr, 'الأجور');
  assert.equal(events[0].after?.hidden, true);
  assert.equal(events[0].after?.group, 'people');
  assert.equal(events[0].after?.permission, 'employee');
  assert.equal(launcherTileAllowed('EMPLOYEE', 'PAYROLL'), false);
});

test('restore default is audited and returns the code title', async () => {
  resetStores();
  await saveStudioOverrides({
    role: 'SUPER_ADMIN',
    uid: 'owner-1',
    email: 'owner@aysed.test',
    sessionCompanyId: 'comp-facility',
    patches: { 'launcher.app.EMPLOYEES': { label: { ar: 'دليل' } } },
  });
  events.length = 0;
  const restored = await resetStudioOverride({
    role: 'HR_MANAGER',
    uid: 'hr-1',
    sessionCompanyId: 'comp-facility',
    key: 'launcher.app.EMPLOYEES',
  });
  assert.equal(restored.status, 403);
  const ok = await resetStudioOverride({
    role: 'SUPER_ADMIN',
    uid: 'owner-1',
    email: 'owner@aysed.test',
    sessionCompanyId: 'comp-facility',
    key: 'launcher.app.EMPLOYEES',
  });
  assert.equal(ok.status, 200);
  const document = ok.body.document as { elements: Record<string, unknown> };
  assert.equal(document.elements['launcher.app.EMPLOYEES'], undefined);
  assert.equal(events[0].details, 'استعادة الافتراضي');
  assert.equal(events[0].before?.titleAr, 'دليل');
  assert.equal(events[0].after?.titleAr, 'الموظفون');
  assert.equal(resolveLauncherTile('EMPLOYEES', null)?.titleAr, 'الموظفون');
});

test('unknown launcher tiles are rejected and the browser no longer writes the document', () => {
  const service = fs.readFileSync('src/services/uiOverrideService.ts', 'utf8');
  assert.match(service, /\/api\/studio\/overrides/);
  assert.doesNotMatch(service, /setDoc\(/);
  const routes = fs.readFileSync('server/studioRoutes.ts', 'utf8');
  assert.doesNotMatch(routes, /req\.body\?\.companyId|req\.body\.companyId/);
  assert.match(fs.readFileSync('server.ts', 'utf8'), /registerStudioRoutes\(app\)/);
  const toggle = fs.readFileSync('src/components/studio/GlobalStudioModeToggle.tsx', 'utf8');
  assert.match(toggle, /if \(!canUseUiStudio\) return null/);
  assert.doesNotMatch(toggle, /Studio Mode/);
  const panel = fs.readFileSync('src/components/studio/UiStudioInspectorSidebar.tsx', 'utf8');
  assert.match(panel, /!selection\) return null/);
  assert.match(panel, /استعادة الافتراضي/);
  assert.doesNotMatch(fs.readFileSync('src/components/studio/UiStudioTarget.tsx', 'utf8'), /انقر للتحرير/);
});

test('an unknown app id is not stored', async () => {
  resetStores();
  const rejected = await saveStudioOverrides({
    role: 'SUPER_ADMIN',
    uid: 'owner-1',
    email: 'owner@aysed.test',
    sessionCompanyId: 'comp-facility',
    patches: { 'launcher.app.NOT_AN_APP': { hidden: false, permission: 'employee' } },
  });
  assert.equal(rejected.status, 400);
  assert.equal(events.length, 0);
});
