import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (url && key) {
  const supabase = createClient(url, key);
  async function test() {
    const { data, error } = await supabase.from('employees').select('*');
    console.log('Employees:', data, error);
    const { data: d2, error: e2 } = await supabase.from('hr_employee').select('*');
    console.log('hr_employee:', d2, e2);
  }
  test().catch(console.error);
} else {
  console.log('No supabase configured in .env');
}
