/**
 * Bundle server AI handlers for Vercel serverless.
 * - Inlines @google/genai (ESM-only; must not be require()'d from CJS wrappers).
 * - Outputs .mjs for explicit ESM; API handlers load via dynamic import().
 */
import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('api/_bundle', { recursive: true });

/** firebase-admin stays external (Vercel Node runtime provides it). */
const external = [
  'firebase-admin',
  'firebase-admin/app',
  'firebase-admin/auth',
  'firebase-admin/firestore',
];

await esbuild.build({
  entryPoints: {
    aiChatCore: 'server/aiChatCore.ts',
    aiTestKeyCore: 'server/aiTestKeyCore.ts',
  },
  outdir: 'api/_bundle',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external,
  sourcemap: true,
  logLevel: 'info',
});

console.log('[bundle-vercel-ai] Wrote api/_bundle/*.mjs (ESM, genai bundled)');
