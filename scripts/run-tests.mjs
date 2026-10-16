import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { nodeTestFiles, plainScriptTests } from './test-partitions.mjs';

const root = process.cwd();
const excluded = new Set([...nodeTestFiles, ...plainScriptTests]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.test.ts')) out.push(path.relative(root, full).split(path.sep).join('/'));
  }
}

const found = [];
walk(root, found);
const nodeImports = [];
for (const file of found) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (text.includes("from 'node:test'") || text.includes('from "node:test"')) nodeImports.push(file);
}

const missingExclude = nodeImports.filter((file) => !excluded.has(file));
const staleExclude = nodeTestFiles.filter((file) => !nodeImports.includes(file));
if (missingExclude.length || staleExclude.length) {
  console.error('test partition is out of date');
  if (missingExclude.length) console.error('node:test files missing from vitest exclude:', missingExclude.join(', '));
  if (staleExclude.length) console.error('listed as node:test but do not import node:test:', staleExclude.join(', '));
  process.exit(1);
}

function run(args) {
  const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : 'all';

if (only === 'all' || only === 'node') run(['tsx', '--test', ...nodeTestFiles]);
if (only === 'all' || only === 'vitest') run(['vitest', 'run']);
if (only === 'all' || only === 'scripts') {
  for (const file of plainScriptTests) run(['tsx', file]);
}
