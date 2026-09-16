import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env');
    process.exit(1);
  }

  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  const body = await res.text();
  console.log('REST status:', res.status);
  const hasLeaveRequests = body.includes('leave_requests');
  const hasLeaveAllocations = body.includes('leave_allocations');
  console.log('leave_requests exposed:', hasLeaveRequests);
  console.log('leave_allocations exposed:', hasLeaveAllocations);

  if (!hasLeaveRequests) {
    console.log('\nTables not visible to PostgREST. Possible causes:');
    console.log('1) SQL not run on this project URL');
    console.log('2) Tables created outside public schema');
    console.log('3) PostgREST schema cache stale — run in SQL Editor:');
    console.log("   NOTIFY pgrst, 'reload schema';");
  }

  const paths = [...body.matchAll(/"\/([^"]+)"/g)]
    .map(m => m[1])
    .filter(p => !p.includes('{'))
    .slice(0, 30);
  if (paths.length) {
    console.log('\nSample REST paths on this project:');
    paths.forEach(p => console.log(' -', p));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
