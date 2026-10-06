/**
 * Bundle server AI handlers for Vercel serverless (avoids ERR_MODULE_NOT_FOUND on /var/task).
 */
import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('api/_bundle', { recursive: true });

await esbuild.build({
  entryPoints: {
    aiChatCore: 'server/aiChatCore.ts',
    aiTestKeyCore: 'server/aiTestKeyCore.ts',
  },
  outdir: 'api/_bundle',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  sourcemap: true,
  logLevel: 'info',
});

console.log('[bundle-vercel-ai] Wrote api/_bundle/aiChatCore.js and aiTestKeyCore.js');
