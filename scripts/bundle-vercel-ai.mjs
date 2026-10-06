/**
 * Emit self-contained CommonJS Vercel API files (no ESM/CJS mismatch at runtime).
 */
import * as esbuild from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';

mkdirSync('api/ai', { recursive: true });

const external = [
  'firebase-admin',
  'firebase-admin/app',
  'firebase-admin/auth',
  'firebase-admin/firestore',
];

try {
  rmSync('api/_bundle', { recursive: true, force: true });
} catch {
  /* ok */
}

await esbuild.build({
  entryPoints: {
    'ai-chat': 'server/vercel/aiChatApi.ts',
    'ai/test-key': 'server/vercel/aiTestKeyApi.ts',
  },
  outdir: 'api',
  outExtension: { '.js': '.cjs' },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external,
  sourcemap: true,
  logLevel: 'info',
  define: {
    'import.meta.env': '{}',
  },
});

console.log('[bundle-vercel-ai] Wrote api/ai-chat.cjs and api/ai/test-key.cjs (CJS)');
