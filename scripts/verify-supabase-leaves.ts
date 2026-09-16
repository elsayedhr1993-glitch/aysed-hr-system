/**
 * Verify Supabase connection + leave module tables.
 *
 * Usage (after filling .env):
 *   npx tsx scripts/verify-supabase-leaves.ts
 */
import dotenv from 'dotenv';
import { getSupabaseAdminClient, isSupabaseConfigured } from '../src/lib/supabase';

dotenv.config();

const LEAVE_TABLES = ['leave_requests', 'leave_allocations', 'leave_settlements'] as const;

async function main() {
  console.log('=== Aysed HR — Supabase Leave Module Check ===\n');

  const url = process.env.VITE_SUPABASE_URL;
  const hasAnon = Boolean(process.env.VITE_SUPABASE_ANON_KEY);
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url) {
    console.error('❌ VITE_SUPABASE_URL missing in .env');
    console.log('\nGet it from: Supabase Dashboard → Project Settings → API → Project URL');
    process.exit(1);
  }

  if (!hasAnon && !hasService) {
    console.error('❌ Add VITE_SUPABASE_ANON_KEY and/or SUPABASE_SERVICE_ROLE_KEY to .env');
    console.log('\nGet keys from: Supabase Dashboard → Project Settings → API → Project API keys');
    process.exit(1);
  }

  console.log(`✓ URL configured: ${url}`);
  console.log(`✓ anon key: ${hasAnon ? 'yes' : 'no'}`);
  console.log(`✓ service role: ${hasService ? 'yes' : 'no'}`);

  if (!isSupabaseConfigured(true)) {
    console.error('\n❌ isSupabaseConfigured() returned false');
    process.exit(1);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.error('\n❌ Could not create Supabase client');
    process.exit(1);
  }

  console.log('\nChecking tables...\n');
  let allOk = true;

  for (const table of LEAVE_TABLES) {
    const { error, data } = await supabase.from(table).select('id').limit(1);
    if (error) {
      allOk = false;
      console.log(`❌ ${table}: ${error.message}`);
      if (
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.code === '42P01' ||
        error.code === 'PGRST204'
      ) {
        console.log('   → Run supabase_leave_schema.sql in SQL Editor, then wait ~30s or reload schema.\n');
      }
    } else {
      console.log(`✓ ${table}: OK (${data?.length ?? 0} sample row(s) readable)`);
    }
  }

  if (!allOk) {
    console.log('\nFix: open Supabase → SQL Editor → paste supabase_leave_schema.sql → Run');
    process.exit(1);
  }

  const counts: Record<string, number | null> = {};
  for (const table of LEAVE_TABLES) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    counts[table] = error ? null : count ?? 0;
  }

  console.log('\nRow counts:');
  for (const table of LEAVE_TABLES) {
    console.log(`  ${table}: ${counts[table] ?? 'unavailable'}`);
  }

  console.log('\n✅ Supabase leave module is ready.');
  console.log('Next: npm run supabase:sync');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
