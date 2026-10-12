import type { EmployeeDirectoryViewRow } from './employeeMapper';
import { checkDocumentExpiry } from './dateUtils';
import {
  buildActiveOnboardingDirectoryKeys,
  employeeMatchesActiveOnboarding,
  shouldDisplayEmployeeAsOnboarding,
} from '../services/onboardingService';

export type ActiveOnboardingDirectoryKeys = ReturnType<typeof buildActiveOnboardingDirectoryKeys>;
import { isEmployeeOnDuty, isEmployeeOnLeave } from './employeeLifecycle';

export type DirectoryKpiFilter =
  | 'all'
  | 'on_duty'
  | 'on_leave'
  | 'residency_expiring'
  | 'moh_expiring'
  | 'expired';

export interface FilterEmployeesDirectoryOptions {
  searchQuery: string;
  selectedDept: string | null;
  selectedStatus: string | null;
  kpiFilter: DirectoryKpiFilter;
  activeOnboardingKeys: ActiveOnboardingDirectoryKeys;
  checkResidencyExpiringSoon: (emp: EmployeeDirectoryViewRow) => boolean;
  checkMohLicenseExpiringSoon: (emp: EmployeeDirectoryViewRow) => boolean;
  checkExpiredDocs: (emp: EmployeeDirectoryViewRow) => boolean;
}

export function filterEmployeesDirectory(
  employees: EmployeeDirectoryViewRow[],
  options: FilterEmployeesDirectoryOptions
): EmployeeDirectoryViewRow[] {
  const {
    searchQuery,
    selectedDept,
    selectedStatus,
    kpiFilter,
    activeOnboardingKeys,
    checkResidencyExpiringSoon,
    checkMohLicenseExpiringSoon,
    checkExpiredDocs,
  } = options;

  const q = searchQuery.trim().toLowerCase();

  return employees.filter((emp) => {
    const empDept = emp.dept || emp.department || '';
    const matchDept =
      selectedDept === null ||
      !selectedDept ||
      empDept === selectedDept ||
      empDept.includes(selectedDept) ||
      selectedDept.includes(empDept);

    let matchStatus = true;
    if (selectedStatus) {
      if (selectedStatus === 'على رأس العمل') {
        matchStatus = isEmployeeOnDuty(emp.status);
      } else if (selectedStatus === 'في إجازة') {
        matchStatus = isEmployeeOnLeave(emp.status);
      } else if (selectedStatus === 'قيد التعيين') {
        matchStatus = employeeMatchesActiveOnboarding(emp, activeOnboardingKeys);
      } else {
        matchStatus = String(emp.status || '').trim() === selectedStatus;
      }
    }

    const matchSearch =
      !q ||
      (emp.nameAr || emp.fullNameAr || '').toLowerCase().includes(q) ||
      (emp.civilId || (emp as { civil_id_number?: string }).civil_id_number || '').includes(
        searchQuery.trim()
      ) ||
      (emp.id || '').toLowerCase().includes(q) ||
      (emp.jobTitle || '').toLowerCase().includes(q) ||
      (emp.specialty || '').toLowerCase().includes(q);

    let matchesKpi = true;
    if (kpiFilter === 'on_duty') {
      matchesKpi = isEmployeeOnDuty(emp.status);
    } else if (kpiFilter === 'on_leave') {
      matchesKpi = isEmployeeOnLeave(emp.status);
    } else if (kpiFilter === 'residency_expiring') {
      matchesKpi = checkResidencyExpiringSoon(emp);
    } else if (kpiFilter === 'moh_expiring') {
      matchesKpi = checkMohLicenseExpiringSoon(emp);
    } else if (kpiFilter === 'expired') {
      matchesKpi = checkExpiredDocs(emp);
    }

    return matchDept && matchStatus && matchSearch && matchesKpi;
  });
}

export function buildEmployeeDirectoryTags(emp: EmployeeDirectoryViewRow): string[] {
  const fromRecord = Array.isArray((emp as { tags?: string[] }).tags)
    ? (emp as { tags?: string[] }).tags!.filter(Boolean).map(String)
    : [];
  const extras = [emp.dept, emp.contractType, emp.specialty].filter(
    (t): t is string => Boolean(t && String(t).trim())
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...fromRecord, ...extras]) {
    const key = t.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out.slice(0, 4);
}

export function employeeDirectoryPresenceOnline(
  emp: EmployeeDirectoryViewRow,
  activeOnboardingKeys: ActiveOnboardingDirectoryKeys
): boolean {
  if (shouldDisplayEmployeeAsOnboarding(emp, activeOnboardingKeys)) return false;
  return isEmployeeOnDuty(emp.status);
}

export function employeeHasDocumentAlert(emp: EmployeeDirectoryViewRow): boolean {
  const civilExp =
    emp.civilIdExpiry ||
    (emp as { civilIdExpiryDate?: string }).civilIdExpiryDate ||
    (emp as { civil_id_expiry?: string }).civil_id_expiry ||
    (emp as { raw_payload?: { civilIdExpiry?: string } }).raw_payload?.civilIdExpiry;
  const passExp = emp.passportExpiry || (emp as { passportExpiryDate?: string }).passportExpiryDate;
  const civilStatus = checkDocumentExpiry(civilExp, 'البطاقة المدنية');
  const passStatus = checkDocumentExpiry(passExp, 'جواز السفر');
  return (
    civilStatus.isExpired ||
    civilStatus.isExpiringSoon ||
    passStatus.isExpired ||
    passStatus.isExpiringSoon
  );
}
