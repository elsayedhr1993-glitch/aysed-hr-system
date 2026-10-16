import { defineConfig } from 'vitest/config';
import { nodeTestFiles, plainScriptTests } from './scripts/test-partitions.mjs';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      ...nodeTestFiles,
      ...plainScriptTests,
    ],
  },
});
