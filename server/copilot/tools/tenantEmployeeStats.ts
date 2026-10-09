import type { Firestore } from 'firebase-admin/firestore';
import { normalizeContractStatus } from '../../../src/utils/contractStatus';
import { fetchTenantContractDocs, fetchTenantEmployeeDocs } from '../tenantFirestore';

function isActiveEmployee(row: Record<string, unknown>): boolean {
  const s = String(row.status || row.contractStatus || '').toUpperCase();
  if (['TERMINATED', 'RESIGNED', 'INACTIVE', 'DELETED'].includes(s)) return false;
  if (s === 'منتهي') return false;
  return true;
}

export type TenantEmployeeStatsResult = {
  companyId: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  runningContracts: number;
  draftContracts: number;
  employeesWithoutRunningContract: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
};

export async function runTenantEmployeeStats(
  db: Firestore,
  companyId: string
): Promise<TenantEmployeeStatsResult> {
  const [employees, contracts] = await Promise.all([
    fetchTenantEmployeeDocs(db, companyId),
    fetchTenantContractDocs(db, companyId),
  ]);

  const activeEmployees = employees.filter(isActiveEmployee);
  const deptMap = new Map<string, number>();
  for (const emp of activeEmployees) {
    const dept = String(emp.department ?? emp.dept ?? 'غير محدد').trim() || 'غير محدد';
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
  }

  const runningContracts = contracts.filter(
    (c) => normalizeContractStatus(String(c.contractStatus ?? c.status ?? '')) === 'running'
  );

  const runningByEmployee = new Set(
    runningContracts.map((c) => String(c.employeeId ?? '').trim()).filter(Boolean)
  );

  const activeWithoutContract = activeEmployees.filter((e) => !runningByEmployee.has(String(e.id)));

  return {
    companyId,
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    inactiveEmployees: employees.length - activeEmployees.length,
    runningContracts: runningContracts.length,
    draftContracts: contracts.filter(
      (c) => normalizeContractStatus(String(c.contractStatus ?? c.status ?? '')) === 'draft'
    ).length,
    employeesWithoutRunningContract: activeWithoutContract.length,
    departmentBreakdown: [...deptMap.entries()]
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
  };
}

export function formatTenantEmployeeStatsReply(
  stats: TenantEmployeeStatsResult,
  isArabic: boolean,
  companyName?: string
): string {
  const org = companyName ? `**${companyName}**` : '';
  if (isArabic) {
    const deptLines = stats.departmentBreakdown
      .map((d) => `- ${d.department}: ${d.count}`)
      .join('\n');
    return [
      org ? `إحصائيات الموظفين لـ ${org}:` : 'إحصائيات الموظفين:',
      `- نشطون: **${stats.activeEmployees}**`,
      `- إجمالي السجلات في الدليل: **${stats.totalEmployees}**`,
      `- غير نشطين / منتهي: **${stats.inactiveEmployees}**`,
      `- عقود سارية (running): **${stats.runningContracts}**`,
      `- عقود مسودة: **${stats.draftContracts}**`,
      `- نشطون بلا عقد ساري: **${stats.employeesWithoutRunningContract}**`,
      deptLines ? `\nتوزيع الأقسام (نشط):\n${deptLines}` : '',
      '\n_مصدر: Firestore (tenant.employeeStats)_',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    org ? `Employee stats for ${org}:` : 'Employee stats:',
    `- Active: **${stats.activeEmployees}**`,
    `- Total directory records: **${stats.totalEmployees}**`,
    `- Running contracts: **${stats.runningContracts}**`,
    `- Active without running contract: **${stats.employeesWithoutRunningContract}**`,
    '\n_Source: Firestore (tenant.employeeStats)_',
  ].join('\n');
}
