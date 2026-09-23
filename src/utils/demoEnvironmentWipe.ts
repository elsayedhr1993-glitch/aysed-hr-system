/** Super Admin only — clears legacy browser caches for demo-to-production cutover. */
export function performDemoEnvironmentWipe(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const allKeys = Object.keys(localStorage);
  allKeys.forEach((k) => {
    if (
      k.includes('manara_') ||
      k.includes('odoo_') ||
      k.includes('employee') ||
      k.includes('attendance') ||
      k.includes('contract') ||
      k.includes('leave') ||
      k.includes('payslip') ||
      k.includes('document') ||
      k.includes('candidate') ||
      k.includes('company') ||
      k.includes('tenant') ||
      k.includes('loan') ||
      k.includes('custody') ||
      k.includes('shift') ||
      k.includes('payroll') ||
      k.includes('audit')
    ) {
      localStorage.removeItem(k);
    }
  });

  localStorage.setItem('manara_contracts_data', JSON.stringify([]));
  localStorage.setItem('manara_attendance_data', JSON.stringify([]));
  localStorage.setItem('manara_leaves_data', JSON.stringify([]));
  localStorage.setItem('manara_documents_data', JSON.stringify([]));
  localStorage.setItem('manara_candidates_data', JSON.stringify([]));
}
