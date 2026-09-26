export interface FacilityLicenseData {
  nameAr: string;
  nameEn: string;
  commercialRegNo: string;
  paciCivilId: string;
  logoUrl?: string;
  mainBranchName: string;
  branchesList: string[];
  mohLicenseNo: string;
  mohStartDate: string;
  mohExpiryDate: string;
  mohApprovedDepts: string[];
  mohSpecialDevices: string[];
  pamFileCode: string;
  authorizedSignatoryName: string;
  authorizedSignatoryCivilId: string;
  wpsBankCode: string;
  wpsEmployerId: string;
  kffLicenseNo: string;
  kffExpiryDate: string;
  baladiyaLicenseNo: string;
  baladiyaExpiryDate: string;
  isCompleted?: boolean;
  lastUpdated?: string;
}

export const createEmptyFacilityData = (): FacilityLicenseData => ({
  nameAr: '',
  nameEn: '',
  commercialRegNo: '',
  paciCivilId: '',
  logoUrl: '',
  mainBranchName: '',
  branchesList: [],
  mohLicenseNo: '',
  mohStartDate: '',
  mohExpiryDate: '',
  mohApprovedDepts: [],
  mohSpecialDevices: [],
  pamFileCode: '',
  authorizedSignatoryName: '',
  authorizedSignatoryCivilId: '',
  wpsBankCode: '',
  wpsEmployerId: '',
  kffLicenseNo: '',
  kffExpiryDate: '',
  baladiyaLicenseNo: '',
  baladiyaExpiryDate: '',
  isCompleted: false,
});
