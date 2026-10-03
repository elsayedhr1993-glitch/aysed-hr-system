export interface ComplianceTreeLicenseItem {
  id: string;
  name: string;
  licenseNumber: string;
  expiryDate: string;
  isPermanent: boolean;
  status: 'active' | 'expiring' | 'expired';
  fileUrl?: string;
  companyDocumentId?: string;
}

export interface ComplianceTreeGovernmentDepartment {
  id: string;
  nameAr: string;
  code: string;
  description: string;
  licenses: ComplianceTreeLicenseItem[];
}

export interface CompanyGovComplianceTreeDoc {
  id: 'gov_license_tree';
  companyId: string;
  departments: ComplianceTreeGovernmentDepartment[];
  updatedAt: string;
  version: number;
}
