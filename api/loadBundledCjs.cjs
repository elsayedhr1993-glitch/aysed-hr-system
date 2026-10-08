'use strict';

const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

function resolveFunctionDir() {
  return __dirname;
}

/** Load esbuild CJS bundle colocated with the Vercel function entry (see scripts/bundle-vercel-ai.mjs). */
function loadBundledHandler(bundleFileName) {
  const functionDir = resolveFunctionDir();
  const candidates = [
    path.join(functionDir, bundleFileName),
    path.join(process.cwd(), 'api', bundleFileName),
    path.join(process.cwd(), 'api', 'ai', bundleFileName),
    path.join(process.cwd(), bundleFileName),
  ];

  for (const bundlePath of candidates) {
    if (!fs.existsSync(bundlePath)) continue;
    try {
      const req = createRequire(bundlePath);
      const mod = req(bundlePath);
      const handler = typeof mod === 'function' ? mod : mod?.default;
      if (typeof handler === 'function') {
        return handler;
      }
    } catch (err) {
      console.error(`[loadBundledCjs] failed to load ${bundlePath}`, err);
    }
  }

  console.error('[loadBundledCjs] bundle not found', { bundleFileName, candidates });

  return async (_req, res) => {
    res.status(503).json({
      success: false,
      error:
        'حزمة خادم الذكاء الاصطناعي غير متوفرة على هذا النشر. أعد النشر بعد npm run build (bundle-vercel-ai).',
      code: 'BUNDLE_MISSING',
      bundle: bundleFileName,
    });
  };
}

module.exports = { loadBundledHandler };
