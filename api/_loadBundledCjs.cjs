'use strict';

const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const BUNDLES_DIR = '_bundles';

function bundleCandidatePaths(bundleFileName) {
  const apiDir = path.join(process.cwd(), 'api');
  return [
    path.join(__dirname, BUNDLES_DIR, bundleFileName),
    path.join(__dirname, bundleFileName),
    path.join(apiDir, BUNDLES_DIR, bundleFileName),
    path.join(apiDir, bundleFileName),
    path.join(apiDir, 'ai', bundleFileName),
    path.join(process.cwd(), bundleFileName),
  ];
}

/** Load esbuild CJS bundle from api/_bundles (not deployed as its own function). */
function loadBundledHandler(bundleFileName) {
  const candidates = bundleCandidatePaths(bundleFileName);

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
