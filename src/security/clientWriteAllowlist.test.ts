import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

type Ops = { create: boolean; update: boolean; delete: boolean };

function parseWritableCollections(source: string): Map<string, Ops> {
  const map = new Map<string, Ops>();
  const frames: string[] = [];
  const frameDepths: number[] = [];
  let depth = 0;
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    const match = rest.match(/^match\s+\/([A-Za-z0-9_]+)\/\{[A-Za-z0-9_]+\}\s*\{/);
    if (match) {
      depth += 1;
      frames.push(match[1]);
      frameDepths.push(depth);
      const collectionPath = frames.join('/');
      if (!map.has(collectionPath)) map.set(collectionPath, { create: false, update: false, delete: false });
      i += match[0].length;
      continue;
    }
    const allow = rest.match(/^allow\s+([^:\n]+):\s*if\s+/);
    if (allow && frames.length) {
      const ops = allow[1].split(',').map((part) => part.trim());
      i += allow[0].length;
      let condDepth = 0;
      let cond = '';
      while (i < source.length) {
        const ch = source[i];
        if (ch === '(') condDepth += 1;
        else if (ch === ')') condDepth = Math.max(0, condDepth - 1);
        else if (ch === ';' && condDepth === 0) break;
        cond += ch;
        i += 1;
      }
      if (cond.trim() !== 'false') {
        const entry = map.get(frames.join('/'));
        if (entry) {
          if (ops.includes('write')) {
            entry.create = true;
            entry.update = true;
            entry.delete = true;
          }
          if (ops.includes('create')) entry.create = true;
          if (ops.includes('update')) entry.update = true;
          if (ops.includes('delete')) entry.delete = true;
        }
      }
      continue;
    }
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (frameDepths.length && depth < frameDepths[frameDepths.length - 1]) {
        frameDepths.pop();
        frames.pop();
      }
    }
    i += 1;
  }
  return map;
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

function readCall(source: string, openParen: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openParen; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return source.slice(openParen + 1, i);
    }
  }
  return source.slice(openParen + 1);
}

function stringConstants(source: string): Map<string, string> {
  const found = new Map<string, string>();
  const pattern = /const\s+([A-Za-z0-9_]+)\s*=\s*['"]([A-Za-z0-9_]+)['"]/g;
  for (const match of source.matchAll(pattern)) found.set(match[1], match[2]);
  return found;
}

function nearestList(source: string, index: number, ident: string, arrays: Map<string, string[]>): string[] | null {
  const pattern = new RegExp(`for\\s*\\(\\s*const\\s+${ident}\\s+of\\s+([A-Za-z0-9_]+)\\s*\\)`, 'g');
  let found: string[] | null = null;
  for (const match of source.matchAll(pattern)) {
    if ((match.index || 0) >= index) break;
    const list = arrays.get(match[1]);
    if (list) found = list;
  }
  return found;
}

function pathsFromDocParts(parts: string[], constants: Map<string, string>, arrays: Map<string, string[]>, source: string, index: number): string[] | null {
  let first = literalName(parts[1] || '', constants, arrays);
  if (!first && /^[A-Za-z0-9_]+$/.test(parts[1] || '')) first = nearestList(source, index, parts[1], arrays);
  if (!first) return null;
  const roots = Array.isArray(first) ? first : [first];
  const nested = parts.length >= 5 ? literalName(parts[3] || '', constants, arrays) : null;
  if (typeof nested === 'string') return roots.map((root) => `${root}/${nested}`);
  return roots;
}

function nearestDocRef(
  source: string,
  index: number,
  ident: string,
  constants: Map<string, string>,
  arrays: Map<string, string[]>
): string[] | null {
  const pattern = new RegExp(`(?:const|let)\\s+${ident}\\s*=\\s*doc\\s*\\(`, 'g');
  let found: string[] | null = null;
  for (const match of source.matchAll(pattern)) {
    if ((match.index || 0) >= index) break;
    const open = (match.index || 0) + match[0].length - 1;
    const parts = splitArgs(readCall(source, open)).map((part) => part.trim());
    const paths = pathsFromDocParts(parts, constants, arrays, source, match.index || 0);
    if (paths) found = paths;
  }
  return found;
}

function collectionPaths(
  args: string,
  constants: Map<string, string>,
  arrays: Map<string, string[]>,
  source: string,
  index: number
): string[] | null {
  const docCall = args.match(/\bdoc\s*\(/);
  const collectionCall = args.match(/\bcollection\s*\(/);
  const start = docCall?.index ?? collectionCall?.index;
  if (start == null) {
    const ident = splitArgs(args)[0]?.trim() || '';
    if (/^[A-Za-z0-9_]+$/.test(ident)) return nearestDocRef(source, index, ident, constants, arrays);
    return null;
  }
  const open = args.indexOf('(', start);
  const parts = splitArgs(readCall(args, open)).map((part) => part.trim());
  return pathsFromDocParts(parts, constants, arrays, source, index);
}

function splitArgs(source: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += source[i + 1] || '';
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1;
    if (ch === ')' || ch === '}' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      args.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current);
  return args;
}

function stringArrays(source: string): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const pattern = /(?:const|let)\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)\]/g;
  for (const match of source.matchAll(pattern)) {
    const names = [...match[2].matchAll(/['"]([A-Za-z0-9_]+)['"]/g)].map((item) => item[1]);
    if (names.length) found.set(match[1], names);
  }
  return found;
}

function literalName(part: string, constants: Map<string, string>, arrays: Map<string, string[]>): string | string[] | null {
  const quoted = part.match(/^['"]([A-Za-z0-9_]+)['"]$/);
  if (quoted) return quoted[1];
  if (constants.has(part)) return constants.get(part) || null;
  if (arrays.has(part)) return arrays.get(part) || null;
  if (part === 'companyRoot' || part === 'companyWrite' || part === 'writeCompanies') return 'companies';
  return null;
}

function walk(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) out.push(full);
  }
}

test('client writes target only collections with an allow that is not false', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  const allowed = parseWritableCollections(rules);
  assert.equal(allowed.get('companies')?.update, true);
  assert.equal(allowed.get('dev_companies')?.update, false);
  assert.equal(allowed.get('subscription_requests')?.create, false);
  assert.equal(allowed.get('platform_settings')?.update, false);
  assert.equal(allowed.has('system_integrations'), false);
  assert.equal(allowed.has('allocations'), false);
  assert.equal(allowed.get('users')?.update, true);
  assert.equal(allowed.get('users')?.delete, false);

  const violations: string[] = [];
  const files: string[] = [];
  walk(path.join(root, 'src'), files);
  for (const file of files) {
    if (file.endsWith(`${path.sep}guardedFirestore.ts`)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const source = stripComments(raw);
    const constants = stringConstants(source);
    const arrays = stringArrays(source);
    const pattern = /\b(setDoc|addDoc|updateDoc|deleteDoc)\s*\(/g;
    for (const match of source.matchAll(pattern)) {
      const op = match[1];
      const args = readCall(source, (match.index || 0) + match[0].length - 1);
      if (/getCompaniesCollectionName\s*\(/.test(args)) {
        violations.push(`${path.relative(root, file)} ${op} uses getCompaniesCollectionName`);
        continue;
      }
      const collections = collectionPaths(args, constants, arrays, source, match.index || 0);
      if (!collections?.length) {
        violations.push(`${path.relative(root, file)} ${op} has no collection literal`);
        continue;
      }
      for (const collection of collections) {
        const rule = allowed.get(collection);
        const writeOk = op === 'deleteDoc' ? rule?.delete : (rule?.create || rule?.update);
        if (!writeOk) violations.push(`${path.relative(root, file)} ${op} ${collection}`);
      }
    }
  }
  assert.deepEqual(violations, []);
});
