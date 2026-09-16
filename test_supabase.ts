import * as dotenv from 'dotenv';
import { getSupabaseAdminClient, isSupabaseConfigured } from './src/lib/supabase';

dotenv.config();

async function test() {
  if (!isSupabaseConfigured(true)) {
    console.log('No supabase configured in .env — set VITE_SUPABASE_URL + keys');
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.log('Failed to create Supabase client');
    return;
  }

  for (const table of ['employees', 'hr_employee', 'leave_requests', 'leave_allocations']) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}:`, error ? `ERROR ${error.message}` : `OK (${count ?? data?.length ?? 0} rows)`);
  }
}

test().catch(console.error);
