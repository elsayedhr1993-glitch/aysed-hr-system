/**
 * Emit self-contained CommonJS Vercel API files (no ESM/CJS mismatch at runtime).
 * Output under api/_bundles so Vercel does not treat .cjs as separate Serverless Functions.
 */
import * as esbuild from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';

const bundlesDir = 'api/_bundles';
mkdirSync(bundlesDir, { recursive: true });

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

try {
  rmSync('api/ai-chat.cjs', { force: true });
  rmSync('api/ai/test-key.cjs', { force: true });
} catch {
  /* ok */
}

await esbuild.build({
  entryPoints: {
    'ai-chat': 'server/vercel/aiChatApi.ts',
    'test-key': 'server/vercel/aiTestKeyApi.ts',
  },
  outdir: bundlesDir,
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

console.log(`[bundle-vercel-ai] Wrote ${bundlesDir}/ai-chat.cjs and ${bundlesDir}/test-key.cjs (CJS)`);
