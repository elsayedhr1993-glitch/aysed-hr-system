import { resolveEmployeeDisplayName } from './employeeDisplayName';

export interface OrgChartNode {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  employeeCode?: string;
  managerId: string | null;
  children: OrgChartNode[];
  depth: number;
}

export interface OrgChartBuildResult {
  roots: OrgChartNode[];
  orphans: string[];
  cycles: string[];
  departments: string[];
  byId: Map<string, Record<string, unknown>>;
}

export function resolveManagerId(employee: Record<string, unknown>): string | null {
  const raw =
    employee.parentId ??
    employee.managerId ??
    employee.reportsTo ??
    employee.directManagerId ??
    null;
  if (raw === null || raw === undefined || raw === '') return null;
  const id = String(raw).trim();
  return id || null;
}

function displayName(employee: Record<string, unknown>): string {
  return resolveEmployeeDisplayName(employee) || String(employee.id || 'موظف');
}

function departmentOf(employee: Record<string, unknown>): string {
  return String(employee.department || employee.dept || 'غير محدد').trim() || 'غير محدد';
}

function jobTitleOf(employee: Record<string, unknown>): string {
  return String(employee.jobTitle || employee.job_title || '—').trim() || '—';
}

export function buildOrgChart(
  employees: Array<Record<string, unknown>>,
  options?: { departmentFilter?: string }
): OrgChartBuildResult {
  const deptFilter = options?.departmentFilter?.trim();
  const scoped =
    deptFilter && deptFilter !== 'ALL'
      ? employees.filter(e => departmentOf(e) === deptFilter)
      : employees;

  const byId = new Map<string, Record<string, unknown>>();
  for (const emp of scoped) {
    const id = String(emp.id || '').trim();
    if (id) byId.set(id, emp);
  }

  const departments = Array.from(
    new Set(employees.map(e => departmentOf(e)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'ar'));

  const childrenMap = new Map<string, string[]>();
  const orphans: string[] = [];
  const parentOf = new Map<string, string | null>();

  for (const emp of scoped) {
    const id = String(emp.id || '').trim();
    if (!id) continue;

    const managerId = resolveManagerId(emp);
    if (!managerId || managerId === id || !byId.has(managerId)) {
      parentOf.set(id, null);
      if (managerId && managerId !== id && !byId.has(managerId)) {
        orphans.push(id);
      }
      continue;
    }

    parentOf.set(id, managerId);
    const siblings = childrenMap.get(managerId) || [];
    siblings.push(id);
    childrenMap.set(managerId, siblings);
  }

  const cycles: string[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  const detectCycle = (nodeId: string): boolean => {
    if (inStack.has(nodeId)) {
      cycles.push(nodeId);
      return true;
    }
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    inStack.add(nodeId);
    const parent = parentOf.get(nodeId);
    if (parent && detectCycle(parent)) {
      parentOf.set(nodeId, null);
    }
    inStack.delete(nodeId);
    return false;
  };

  for (const id of byId.keys()) {
    detectCycle(id);
  }

  const buildNode = (id: string, depth: number, path: Set<string>): OrgChartNode => {
    const emp = byId.get(id)!;
    if (path.has(id)) {
      return {
        id,
        name: displayName(emp),
        jobTitle: jobTitleOf(emp),
        department: departmentOf(emp),
        employeeCode: String(emp.employeeCode || emp.id || ''),
        managerId: parentOf.get(id) ?? null,
        children: [],
        depth,
      };
    }
    const nextPath = new Set(path);
    nextPath.add(id);
    const childIds = (childrenMap.get(id) || []).filter(cid => byId.has(cid));
    childIds.sort((a, b) => displayName(byId.get(a)!).localeCompare(displayName(byId.get(b)!), 'ar'));

    return {
      id,
      name: displayName(emp),
      jobTitle: jobTitleOf(emp),
      department: departmentOf(emp),
      employeeCode: String(emp.employeeCode || emp.id || ''),
      managerId: parentOf.get(id) ?? null,
      children: childIds.map(cid => buildNode(cid, depth + 1, nextPath)),
      depth,
    };
  };

  const rootIds = scoped
    .map(e => String(e.id || '').trim())
    .filter(id => id && (parentOf.get(id) === null || parentOf.get(id) === undefined));

  rootIds.sort((a, b) => displayName(byId.get(a)!).localeCompare(displayName(byId.get(b)!), 'ar'));

  const roots = rootIds.map(id => buildNode(id, 0, new Set()));

  return { roots, orphans, cycles, departments, byId };
}

export function getManagerChain(
  employeeId: string,
  byId: Map<string, Record<string, unknown>>
): OrgChartNode[] {
  const chain: OrgChartNode[] = [];
  const seen = new Set<string>();
  let currentId: string | null = employeeId;

  while (currentId && byId.has(currentId) && !seen.has(currentId)) {
    seen.add(currentId);
    const emp = byId.get(currentId)!;
    chain.unshift({
      id: currentId,
      name: displayName(emp),
      jobTitle: jobTitleOf(emp),
      department: departmentOf(emp),
      managerId: resolveManagerId(emp),
      children: [],
      depth: 0,
    });
    const parent = resolveManagerId(emp);
    if (!parent || !byId.has(parent)) break;
    currentId = parent;
  }

  return chain;
}

export function collectSubtreeIds(node: OrgChartNode): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children) {
    for (const id of collectSubtreeIds(child)) ids.add(id);
  }
  return ids;
}

export function findNodeById(roots: OrgChartNode[], id: string): OrgChartNode | null {
  for (const root of roots) {
    const found = walk(root, id);
    if (found) return found;
  }
  return null;
}

function walk(node: OrgChartNode, id: string): OrgChartNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = walk(child, id);
    if (found) return found;
  }
  return null;
}

export interface OrgChartPrintLine {
  depth: number;
  name: string;
  jobTitle: string;
  department: string;
  employeeCode: string;
}

export function flattenOrgTreeForPrint(roots: OrgChartNode[]): OrgChartPrintLine[] {
  const lines: OrgChartPrintLine[] = [];
  const visit = (node: OrgChartNode) => {
    lines.push({
      depth: node.depth,
      name: node.name,
      jobTitle: node.jobTitle,
      department: node.department,
      employeeCode: node.employeeCode || node.id,
    });
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return lines;
}

export function employeeMatchesOrgSearch(employee: Record<string, unknown>, query: string): boolean {
  if (!query.trim()) return false;
  const q = query.toLowerCase();
  const fields = [
    employee.nameAr,
    employee.fullNameAr,
    employee.name,
    employee.fullNameEn,
    employee.nameEn,
    employee.employeeCode,
    employee.civilId,
    employee.jobTitle,
    employee.department,
    employee.dept,
  ];
  return fields.some(v => v && String(v).toLowerCase().includes(q));
}
