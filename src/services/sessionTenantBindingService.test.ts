import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { profileCreatePatch, sessionBindingPatch } from './sessionTenantBindingService.ts';
import { companyCollectionForBrowserWrite } from '../lib/firebase.ts';

test('session and profile patches keep language-ready fields and omit role', () => {
  const bound = sessionBindingPatch({ email: 'HR@Clinic.test', companyId: 'comp-1', role: 'HR_MANAGER' } as never);
  assert.equal(bound.email, 'hr@clinic.test');
  assert.equal(bound.companyId, 'comp-1');
  assert.equal('role' in bound, false);

  const owner = sessionBindingPatch({ email: 'Admin@Aysed.com', companyId: 'comp-1', superAdmin: true });
  assert.deepEqual(owner, { email: 'admin@aysed.com' });
  assert.equal('role' in owner, false);

  const created = profileCreatePatch({
    email: 'user@clinic.test',
    name: 'مستخدم',
    companyId: 'comp-1',
    photoURL: 'https://cdn.example/photo.png',
    createdAt: '2026-10-17T00:00:00.000Z',
    role: 'COMPANY_ADMIN',
  } as never);
  assert.equal(created.photoURL, 'https://cdn.example/photo.png');
  assert.equal(created.companyId, 'comp-1');
  assert.equal('role' in created, false);
});

test('AuthContext user writes do not send role, and language and photo writers remain', () => {
  const auth = fs.readFileSync(new URL('../context/AuthContext.tsx', import.meta.url), 'utf8');
  const binding = fs.readFileSync(new URL('./sessionTenantBindingService.ts', import.meta.url), 'utf8');
  const language = fs.readFileSync(new URL('../components/LanguageAccountSync.tsx', import.meta.url), 'utf8');
  assert.equal(/writeUser\([\s\S]{0,240}role:/.test(auth), false);
  assert.equal(/setDoc\([\s\S]{0,320}role:/.test(auth), false);
  assert.equal(/setDoc\([\s\S]{0,240}role:/.test(binding), false);
  assert.equal(auth.includes('photoURL'), true);
  assert.equal(language.includes('accountLanguageFields'), true);
  assert.equal(language.includes('setDoc'), true);
});

test('ais-dev company collection is not a browser write target', () => {
  assert.equal(companyCollectionForBrowserWrite('dev_companies'), null);
  assert.equal(companyCollectionForBrowserWrite('companies'), 'companies');
});
