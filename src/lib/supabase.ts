import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(url?: string): string {
  const fallback = 'https://ywukequruqkkwvqkvcia.supabase.co';
  if (!url || typeof url !== 'string') return fallback;
  let cleaned = url.trim();
  // Strip trailing /rest/v1/ or /rest/v1 or trailing slashes
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned.startsWith('http') ? cleaned : fallback;
}

function cleanSupabaseKey(key?: string): string {
  const fallback = 'sb_publishable_DsRlxv6K9fseukY4pFLXzg_7NsWee9Y';
  if (!key || typeof key !== 'string') return fallback;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export const cleanUrl = cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const cleanAnonKey = cleanSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  !cleanUrl.includes('placeholder-supabase-url') &&
  cleanAnonKey &&
  !cleanAnonKey.includes('placeholder-anon-key')
);

export const supabase = createClient(cleanUrl, cleanAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * دالة لاختبار والتحقق من صحة الاتصال المباشر مع Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; projectRef?: string }> {
  try {
    const res = await fetch(`${cleanUrl}/auth/v1/settings`, {
      headers: {
        apikey: cleanAnonKey,
        Authorization: `Bearer ${cleanAnonKey}`,
      },
    });
    if (res.ok) {
      return {
        success: true,
        message: 'الاتصال بقاعدة بيانات Supabase نشط وموثق بنجاح.',
        projectRef: cleanUrl.split('//')[1]?.split('.')[0]
      };
    } else {
      return {
        success: false,
        message: `استجابة البوابة السحابية: (${res.status} ${res.statusText})`,
        projectRef: cleanUrl.split('//')[1]?.split('.')[0]
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'تعذر الاتصال بـ Supabase'
    };
  }
}

export interface Employee {
  id: string;
  company_id?: string;
  full_name_ar: string;
  full_name_en?: string;
  employee_code?: string | null;
  hire_date?: string | null;
  gender?: 'male' | 'female' | string;
  status?: string;
  [key: string]: any;
}

export interface LeaveRequest {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'casual' | 'hajj' | 'maternity' | 'unpaid';
  start_date: string;
  end_date: string;
  days: number;
  unpaid_days?: number;
  reason?: string | null;
  status: string;
  created_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  [key: string]: any;
}

export interface LeaveBalance {
  id: string;
  company_id: string;
  employee_id: string;
  annual_used?: number;
  sick_used?: number;
  sick_half_used?: number;
  sick_unpaid_used?: number;
  casual_used?: number;
  hajj_used?: number;
  hajj_taken?: boolean;
  maternity_used?: number;
  unpaid_used?: number;
  [key: string]: any;
}
