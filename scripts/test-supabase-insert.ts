import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function main() {
  const url = process.env.VITE_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
  const sb = createClient(url, key);

  const row = {
    id: 'sync-test-1',
    company_id: 'comp-test',
    employee_id: 'emp-test',
    leave_type: 'ANNUAL',
    start_date: '2026-01-01',
    end_date: '2026-01-02',
    days: 1,
    status: 'DRAFT',
  };

  const sel = await sb.from('leave_requests').select('id').limit(1);
  console.log('select:', sel.error?.message || 'OK', sel.data);

  const ins = await sb.from('leave_requests').insert(row);
  console.log('insert:', ins.error?.message || 'OK');

  const ups = await sb.from('leave_requests').upsert(row, { onConflict: 'id' });
  console.log('upsert:', ups.error?.message || 'OK');

  await sb.from('leave_requests').delete().eq('id', 'sync-test-1');
}

main().catch(console.error);
