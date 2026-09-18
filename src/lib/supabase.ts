import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function readViteEnv(key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return String(import.meta.env[key]);
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return String(process.env[key]);
  }
  return undefined;
}

function readSupabaseUrl(): string | undefined {
  return readViteEnv('VITE_SUPABASE_URL');
}

function readSupabaseAnonKey(): string | undefined {
  return readViteEnv('VITE_SUPABASE_ANON_KEY');
}

function readSupabaseServiceKey(): string | undefined {
  if (typeof window !== 'undefined') return undefined;
  if (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) {
    return String(process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return undefined;
}

export function isSupabaseConfigured(preferServiceRole = false): boolean {
  const url = readSupabaseUrl();
  const key = preferServiceRole
    ? readSupabaseServiceKey() || readSupabaseAnonKey()
    : readSupabaseAnonKey() || readSupabaseServiceKey();
  return Boolean(url && key);
}

/** Browser / Vite client (anon key). */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(readSupabaseUrl()!, readSupabaseAnonKey() || readSupabaseServiceKey()!);
  }
  return browserClient;
}

/** Node scripts / server-side (service role preferred). */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured(true)) return null;
  if (!adminClient) {
    adminClient = createClient(readSupabaseUrl()!, readSupabaseServiceKey() || readSupabaseAnonKey()!);
  }
  return adminClient;
}
