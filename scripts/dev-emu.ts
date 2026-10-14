import { spawn, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function canRun(command: string, args: string[]): boolean {
  try {
    execFileSync(command, args, {
      stdio: 'ignore',
      windowsHide: true,
      shell: process.platform === 'win32',
    });
    return true;
  } catch {
    return false;
  }
}

const missing: string[] = [];
if (!canRun('java', ['-version'])) {
  missing.push('Java runtime (java on PATH). The Firebase emulators need it.');
}

const firebaseBin = canRun('firebase', ['--version'])
  ? 'firebase'
  : canRun('npx', ['--no-install', 'firebase', '--version'])
    ? 'npx'
    : '';
if (!firebaseBin) {
  missing.push('firebase-tools. Install it locally or on PATH; this script does not download it.');
}

if (missing.length > 0) {
  console.error('npm run dev:emu cannot start yet:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8')) as {
  projectId?: string;
};
const projectId = String(config.projectId || '').trim();
if (!projectId) {
  console.error('firebase-applet-config.json has no projectId.');
  process.exit(1);
}

const env = { ...process.env, VITE_USE_EMULATOR: 'true' };
const firebaseArgs = firebaseBin === 'npx'
  ? ['--no-install', 'firebase', 'emulators:exec', '--only', 'auth,firestore', '--project', projectId, 'npx tsx server.ts']
  : ['emulators:exec', '--only', 'auth,firestore', '--project', projectId, 'npx tsx server.ts'];

const child = spawn(firebaseBin, firebaseArgs, {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 1));
