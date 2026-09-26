export function inferDefaultMedicalLicenseFlag(employee: Record<string, unknown>): boolean {
  if (employee.hasMedicalLicense === true) return true;
  if (employee.hasMedicalLicense === false) return false;
  const dept = String(employee.dept || employee.department || '');
  const job = String(employee.jobTitle || '');
  return (
    ['الأطباء', 'التمريض'].includes(dept) ||
    job.includes('طبيب') ||
    job.includes('ممرض') ||
    job.includes('دكتور') ||
    Boolean(employee.mohLicense || employee.mohLicenseNo)
  );
}

export function employeeRequiresMohCompliance(employee: Record<string, unknown>): boolean {
  if (employee.hasMedicalLicense === true) return true;
  if (employee.hasMedicalLicense === false) return false;
  return inferDefaultMedicalLicenseFlag(employee);
}

export function employeeRequiresBadges(employee: Record<string, unknown>): boolean {
  return employee.hasBadges === true;
}

export function employeeRequiresDrivingLicense(employee: Record<string, unknown>): boolean {
  return employee.hasDrivingLicense === true;
}

export function mohComplianceGaps(employee: Record<string, unknown>): string[] {
  if (!employeeRequiresMohCompliance(employee)) return [];
  const gaps: string[] = [];
  if (!String(employee.mohLicense || employee.mohLicenseNo || '').trim()) {
    gaps.push('رقم ترخيص MOH');
  }
  if (!String(employee.mohLicenseExpiry || '').trim()) {
    gaps.push('تاريخ انتهاء ترخيص MOH');
  }
  if (!String(employee.specialty || employee.mohSpecialty || '').trim()) {
    gaps.push('المسمى / التخصص الطبي');
  }
  const files = employee.documentFiles as Record<string, unknown> | undefined;
  if (!files?.mohLicense) {
    gaps.push('مرفق ترخيص MOH');
  }
  return gaps;
}
