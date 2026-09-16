import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { HrLeaveAllocation, LeaveRequest, LeaveSettlementVoucher } from '../types';
import {
  fromLeaveAllocationDbRow,
  fromLeaveDbRow,
  fromLeaveSettlementDbRow,
  toLeaveAllocationDbRow,
  toLeaveDbRow,
  toLeaveSettlementDbRow,
} from './leaveDbAdapter';

export { isSupabaseConfigured };

export async function upsertLeaveToSupabase(
  leave: LeaveRequest,
  companyId?: string,
  useAdmin = false
): Promise<boolean> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return false;

  const row = toLeaveDbRow(leave, companyId);
  const { error } = await supabase.from('leave_requests').upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('[leaveSupabaseSync] upsert failed:', error.message);
    return false;
  }

  return true;
}

export async function fetchLeavesFromSupabase(
  companyId: string,
  useAdmin = false
): Promise<LeaveRequest[]> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[leaveSupabaseSync] fetch failed:', error.message);
    return [];
  }

  return (data || []).map(fromLeaveDbRow);
}

export async function upsertLeaveAllocationToSupabase(
  allocation: HrLeaveAllocation | Record<string, unknown>,
  companyId?: string,
  useAdmin = false
): Promise<boolean> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return false;

  const row = toLeaveAllocationDbRow(allocation, companyId);
  const { error } = await supabase.from('leave_allocations').upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('[leaveSupabaseSync] allocation upsert failed:', error.message);
    return false;
  }

  return true;
}

export async function fetchLeaveAllocationsFromSupabase(
  companyId: string,
  useAdmin = false
): Promise<HrLeaveAllocation[]> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leave_allocations')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[leaveSupabaseSync] allocation fetch failed:', error.message);
    return [];
  }

  return (data || []).map(fromLeaveAllocationDbRow);
}

export async function upsertLeaveSettlementToSupabase(
  voucher: LeaveSettlementVoucher | Record<string, unknown>,
  companyId?: string,
  useAdmin = false
): Promise<boolean> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return false;

  const row = toLeaveSettlementDbRow(voucher, companyId);
  const { error } = await supabase.from('leave_settlements').upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('[leaveSupabaseSync] settlement upsert failed:', error.message);
    return false;
  }

  return true;
}

export async function fetchLeaveSettlementsFromSupabase(
  companyId: string,
  useAdmin = false
): Promise<LeaveSettlementVoucher[]> {
  const supabase = useAdmin ? getSupabaseAdminClient() : getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leave_settlements')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[leaveSupabaseSync] settlement fetch failed:', error.message);
    return [];
  }

  return (data || []).map(fromLeaveSettlementDbRow);
}
