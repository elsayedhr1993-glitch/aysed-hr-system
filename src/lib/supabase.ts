import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function readSupabaseUrl(): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  return process.env.VITE_SUPABASE_URL;
}

function readSupabaseAnonKey(): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  return process.env.VITE_SUPABASE_ANON_KEY;
}

function readSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
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
