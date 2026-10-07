export type DepartmentId = 'MOH' | 'PAM' | 'KFF' | 'BALADIYA' | 'MOI_TRAFFIC';

export interface LicenseDocument {
  id: string;
  companyId: string;
  departmentId: DepartmentId;
  folderId: string;
  title: string;
  documentNumber: string;
  expiryDate: string;
  fileUrl?: string;
  employeeId?: string;
  employeeName?: string;
  vehiclePlate?: string;
  updatedAt?: string;
}

export interface FolderConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  code: string;
  icon: string;
  color: string;
  folders: FolderConfig[];
}

export type LicenseExpiryStatus = 'valid' | 'warning' | 'expired';

export interface LicenseDaysRemaining {
  days: number;
  status: LicenseExpiryStatus;
  label: string;
}
