import { resolveManagerId, buildOrgChart } from './orgChartUtils';

export type OrgRootDiagnosis = {
  employees: number;
  roots: number;
  emptyManager: number;
  managerFieldEmpty: boolean;
};

/** A person is a root when parentId, managerId, reportsTo, and directManagerId do not point at a coworker. */
export function diagnoseOrgRoots(employees: Array<Record<string, unknown>>): OrgRootDiagnosis {
  const emptyManager = employees.filter((employee) => !resolveManagerId(employee)).length;
  const roots = buildOrgChart(employees).roots.length;
  return {
    employees: employees.length,
    roots,
    emptyManager,
    managerFieldEmpty: employees.length > 0 && emptyManager === employees.length,
  };
}
