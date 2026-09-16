-- Leave module: leave_requests, leave_allocations, leave_settlements
-- Mirrors Firestore leave_requests collection for reporting / backup

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    leave_type TEXT NOT NULL DEFAULT 'ANNUAL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC(8, 2) NOT NULL DEFAULT 0,
    paid_days NUMERIC(8, 2),
    unpaid_days NUMERIC(8, 2) DEFAULT 0,
    reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_company ON public.leave_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);

CREATE TABLE IF NOT EXISTS public.leave_allocations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    leave_type TEXT NOT NULL DEFAULT 'ANNUAL',
    allocation_type TEXT DEFAULT 'regular',
    number_of_days NUMERIC(8, 2) NOT NULL DEFAULT 0,
    consumed_days NUMERIC(8, 2) NOT NULL DEFAULT 0,
    encashed_days NUMERIC(8, 2) NOT NULL DEFAULT 0,
    remaining_days NUMERIC(8, 2),
    date_from DATE,
    date_to DATE,
    state TEXT DEFAULT 'validate',
    name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leave_allocations_company ON public.leave_allocations(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_allocations_employee ON public.leave_allocations(employee_id);

CREATE TABLE IF NOT EXISTS public.leave_settlements (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    settlement_mode TEXT DEFAULT 'ENCASHMENT_LIQUIDATION',
    carried_over_days NUMERIC(8, 2) DEFAULT 0,
    accrued_days NUMERIC(8, 2) DEFAULT 0,
    consumed_days NUMERIC(8, 2) DEFAULT 0,
    encashed_days NUMERIC(8, 2) DEFAULT 0,
    daily_wage NUMERIC(10, 3) DEFAULT 0,
    net_payable NUMERIC(12, 3) DEFAULT 0,
    status TEXT DEFAULT 'DRAFT',
    notes TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leave_settlements_company ON public.leave_settlements(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_settlements_employee ON public.leave_settlements(employee_id);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_requests_all" ON public.leave_requests;
CREATE POLICY "leave_requests_all" ON public.leave_requests
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leave_allocations_all" ON public.leave_allocations;
CREATE POLICY "leave_allocations_all" ON public.leave_allocations
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leave_settlements_all" ON public.leave_settlements;
CREATE POLICY "leave_settlements_all" ON public.leave_settlements
    FOR ALL USING (true) WITH CHECK (true);
