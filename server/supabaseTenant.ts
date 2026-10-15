/**
 * Every server Supabase read or write must filter by the session company.
 * There is no query in server.ts today; new queries go through this helper.
 */
export function requireSessionCompanyId(companyId: string | undefined): string {
  const id = String(companyId || '').trim();
  if (!id) {
    throw new Error('جلسة بلا منشأة — مرفوض استعلام Supabase');
  }
  return id;
}

export function scopedSupabaseFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  sessionCompanyId: string | undefined,
  column = 'company_id'
): T {
  return query.eq(column, requireSessionCompanyId(sessionCompanyId));
}
