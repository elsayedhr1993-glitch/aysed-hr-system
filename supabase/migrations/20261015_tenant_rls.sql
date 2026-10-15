-- Not applied to the live project. Tenant isolation for the browser role.
-- The service role bypasses RLS and stays server-only.

CREATE OR REPLACE FUNCTION public.aysed_jwt_company()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'company_id',
    auth.jwt() ->> 'companyId',
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.aysed_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT upper(COALESCE(auth.jwt() ->> 'role', ''));
$$;

DROP POLICY IF EXISTS "Allow authenticated read/write on employee documents" ON public.hr_employee_documents;
DROP POLICY IF EXISTS "leave_requests_all" ON public.leave_requests;
DROP POLICY IF EXISTS "leave_allocations_all" ON public.leave_allocations;
DROP POLICY IF EXISTS "leave_settlements_all" ON public.leave_settlements;

ALTER TABLE public.hr_employee_documents ENABLE ROW LEVEL SECURITY;
-- hr_employee_documents has no company_id column. With the open policy removed,
-- authenticated and anon have no row access. The service role still bypasses RLS.

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY leave_requests_tenant ON public.leave_requests
  FOR ALL
  TO authenticated
  USING (company_id = public.aysed_jwt_company() AND public.aysed_jwt_role() <> '')
  WITH CHECK (company_id = public.aysed_jwt_company() AND public.aysed_jwt_role() <> 'EMPLOYEE');

CREATE POLICY leave_allocations_tenant ON public.leave_allocations
  FOR ALL
  TO authenticated
  USING (
    company_id = public.aysed_jwt_company()
    AND public.aysed_jwt_role() IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'HR_USER', 'FINANCE')
  )
  WITH CHECK (
    company_id = public.aysed_jwt_company()
    AND public.aysed_jwt_role() IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  );

CREATE POLICY leave_settlements_tenant ON public.leave_settlements
  FOR ALL
  TO authenticated
  USING (
    company_id = public.aysed_jwt_company()
    AND public.aysed_jwt_role() IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'FINANCE')
  )
  WITH CHECK (
    company_id = public.aysed_jwt_company()
    AND public.aysed_jwt_role() IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'FINANCE')
  );
