import { spawn, execFileSync } from 'node:child_process';

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

const projectId = 'demo-aysed';
if (!projectId.startsWith('demo-')) {
  console.error('Refusing to start emulators: project must be demo-aysed.');
  process.exit(1);
}

const env = { ...process.env, VITE_USE_EMULATOR: 'true' };
const inner = 'npx tsx scripts/seed-dev.ts && npx tsx server.ts';
const firebaseCommand = firebaseBin === 'npx'
  ? `npx --no-install firebase emulators:exec --only auth,firestore --project ${projectId} "${inner}"`
  : `firebase emulators:exec --only auth,firestore --project ${projectId} "${inner}"`;

const child = spawn(firebaseCommand, {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 1));
