import type { InlinePersistPatch } from '../context/InlineEditContext';

const NUMERIC_EMPLOYEE_FIELDS = new Set([
  'basicSalary',
  'salary',
  'housingAllowance',
  'transportAllowance',
  'medicalAllowance',
  'otherAllowance',
  'otherAllowances',
  'allowances',
]);

export function normalizeEmployeeInlinePatch(patch: InlinePersistPatch): InlinePersistPatch {
  const out: InlinePersistPatch = { ...patch };
  for (const key of Object.keys(out)) {
    if (NUMERIC_EMPLOYEE_FIELDS.has(key)) {
      const raw = out[key];
      out[key] = parseFloat(String(raw ?? '')) || 0;
    }
  }
  return out;
}

/** Recompute salary totals when wage fields change (matches bulk save shape). */
export function enrichEmployeeAfterInlinePatch(employee: Record<string, unknown>): Record<string, unknown> {
  const bSal =
    parseFloat(
      String(
        employee.basicSalary !== undefined ? employee.basicSalary : employee.salary ?? 0
      )
    ) || 0;
  const hAll = parseFloat(String(employee.housingAllowance ?? 0)) || 0;
  const tAll = parseFloat(String(employee.transportAllowance ?? 0)) || 0;
  const mAll = parseFloat(String(employee.medicalAllowance ?? 0)) || 0;
  const oAll =
    parseFloat(
      String(
        employee.otherAllowances !== undefined
          ? employee.otherAllowances
          : employee.otherAllowance ?? employee.allowances ?? 0
      )
    ) || 0;
  const totAllowances = hAll + tAll + mAll + oAll;
  const totSal = bSal + totAllowances;

  return {
    ...employee,
    basicSalary: bSal,
    contractSalary: bSal,
    housingAllowance: hAll,
    transportAllowance: tAll,
    medicalAllowance: mAll,
    otherAllowance: oAll,
    otherAllowances: oAll,
    allowances: totAllowances,
    totalSalary: totSal,
    salary: totSal,
  };
}

const SALARY_TOUCH_KEYS = new Set([
  'basicSalary',
  'salary',
  'housingAllowance',
  'transportAllowance',
  'medicalAllowance',
  'otherAllowance',
  'otherAllowances',
  'allowances',
]);

export function mergeEmployeeInlinePatch(
  prev: Record<string, unknown>,
  patch: InlinePersistPatch
): Record<string, unknown> {
  const normalized = normalizeEmployeeInlinePatch(patch);
  let next: Record<string, unknown> = { ...prev, ...normalized };
  if (Object.keys(normalized).some((k) => SALARY_TOUCH_KEYS.has(k))) {
    next = enrichEmployeeAfterInlinePatch(next);
  }
  return next;
}
