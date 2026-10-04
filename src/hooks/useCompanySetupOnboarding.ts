import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Company, CompanyComplianceDoc } from '../types';
import { subscribeCompanyCompliance } from '../services/companyComplianceService';
import {
  buildCompanySetupOnboardingState,
  type CompanySetupOnboardingState,
} from '../services/companySetupOnboardingService';
import { getLeaveMasterPolicy, type LeavePolicyData } from '../components/leaves/LeavePolicyWizardModal';
import { loadTenantPolicy } from '../services/hrPolicyStorage';
import { TIMEOFF_POLICY_STORAGE_KEY } from '../components/leaves/LeavePolicyWizardModal';
import { getAttendanceMasterPolicy } from '../components/attendance/AttendanceSetupWizardModal';
import { isQueryableTenantCompanyId } from '../utils/tenantCompanyId';

export function useCompanySetupOnboarding(
  company: Company | null | undefined,
  employeesCount: number,
  distinctJobTitles: number
): CompanySetupOnboardingState | null {
  const companyId = company?.id || '';
  const [compliance, setCompliance] = useState<CompanyComplianceDoc | null>(null);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [leavePolicy, setLeavePolicy] = useState<LeavePolicyData | null>(null);

  useEffect(() => {
    if (!isQueryableTenantCompanyId(companyId)) {
      setCompliance(null);
      return;
    }
    return subscribeCompanyCompliance(companyId, setCompliance);
  }, [companyId]);

  useEffect(() => {
    if (!isQueryableTenantCompanyId(companyId)) {
      setDepartmentCount(0);
      return;
    }
    const q = query(collection(db, 'departments'), where('companyId', '==', companyId));
    return onSnapshot(
      q,
      (snap) => setDepartmentCount(snap.size),
      () => setDepartmentCount(0)
    );
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setLeavePolicy(getLeaveMasterPolicy());
      return;
    }
    const cacheKey = `${TIMEOFF_POLICY_STORAGE_KEY}_${companyId}`;
    void loadTenantPolicy(companyId, 'leave_policy', getLeaveMasterPolicy, cacheKey).then(setLeavePolicy);
  }, [companyId]);

  const attendanceConfigured = useMemo(() => {
    const p = getAttendanceMasterPolicy(company || companyId || undefined);
    return Boolean(p?.isActivated);
  }, [company, companyId]);

  return useMemo(() => {
    if (!isQueryableTenantCompanyId(companyId)) return null;
    return buildCompanySetupOnboardingState({
      company,
      compliance,
      departmentCount,
      employeesCount,
      distinctJobTitles,
      leavePolicy,
      attendancePolicyConfigured: attendanceConfigured,
    });
  }, [
    company,
    companyId,
    compliance,
    departmentCount,
    employeesCount,
    distinctJobTitles,
    leavePolicy,
    attendanceConfigured,
  ]);
}
