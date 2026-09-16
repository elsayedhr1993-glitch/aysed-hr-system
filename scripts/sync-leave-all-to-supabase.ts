/**
 * Sync leave_requests, leave_allocations, and leave_settlements to Supabase.
 *
 * Usage: npx tsx scripts/sync-leave-all-to-supabase.ts
 */
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const scripts = [
  'scripts/sync-leave-requests-to-supabase.ts',
  'scripts/sync-leave-allocations-to-supabase.ts',
  'scripts/sync-leave-settlements-to-supabase.ts',
];

for (const script of scripts) {
  console.log(`\n--- Running ${script} ---\n`);
  execSync(`npx tsx ${script}`, { stdio: 'inherit', cwd: process.cwd() });
}

console.log('\n✅ Full leave module sync complete.');
