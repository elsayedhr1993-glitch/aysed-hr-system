import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useCompany } from './CompanyContext';
import { useAuth } from './AuthContext';
import { loadCompanySettings, saveCompanySettings } from '../services/companySettingsStorage';
import { toast } from 'react-hot-toast';

export interface SystemSettings {
  // 1. بيانات المنشأة (Company Profile)
  companyNameAr: string;
  companyNameEn: string;
  logo: string;
  crNumber: string;
  mohLicense: string;
  civilIdCompany: string;
  pifssNumber: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  headerMarginTop: number;
  showLogoOnPrint: boolean;

  // 2. إعدادات الرواتب وبنك WPS
  pamId: string; // رقم ملف الشؤون (PAM ID)
  bankName: string;
  bankCode: string;
  iban: string;
  branchCode: string;
  wpsCorporateId: string;
  workingDaysCalculation: '26_DAYS' | '30_DAYS';
  enableWpsSif: boolean;
  salaryCutoffDay: number;

  // 3. إعدادات الإجازات ومحرك التراكم (legacy keys — leave_policy is source of truth)
  monthlyAccrualRate: number; // 2.5 يوم شهرياً
  unpaidLeaveFreezesAccrual: boolean;
  unpaidLeaveExcludesService: boolean;
  maxCarryoverDays: number;
  enableAdvanceLeaveSalary: boolean;

  // 4. إعدادات الدوام والبصمة
  standardDailyHours: number;
  weeklyWorkHours: number;
  gracePeriodMinutes: number;
  overtimeRateStandard: number;
  overtimeRateHoliday: number;
  biometricIp: string;
  biometricPort: string;
  enableBiometricSync: boolean;

  // 5. حاسبة نهاية الخدمة
  indemnityFirst5YearsDays: number;
  indemnitySubsequentYearsDays: number;
  indemnityMaxCapMonths: number;
  applyResignationTiersArticle53: boolean;
  includeAllowancesInIndemnity: boolean;
  workingDaysPerMonthDivisor: number;

  // 6. الذكاء الاصطناعي ومعالجة المستندات
  geminiApiKey: string;
  ocrEngineMode: 'cloud_server' | 'direct_client';
  autoExtractDocuments: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  enableAiAssistant: boolean;
}

export const defaultSettings: SystemSettings = {
  companyNameAr: '',
  companyNameEn: '',
  logo: '',
  crNumber: '',
  mohLicense: '',
  civilIdCompany: '',
  pifssNumber: '',
  address: '',
  phone: '',
  email: '',
  currency: 'KWD',
  headerMarginTop: 48,
  showLogoOnPrint: true,

  pamId: '',
  bankName: '',
  bankCode: '',
  iban: '',
  branchCode: '',
  wpsCorporateId: '',
  workingDaysCalculation: '26_DAYS',
  enableWpsSif: true,
  salaryCutoffDay: 25,

  monthlyAccrualRate: 2.5,
  unpaidLeaveFreezesAccrual: true,
  unpaidLeaveExcludesService: true,
  maxCarryoverDays: 60,
  enableAdvanceLeaveSalary: true,

  standardDailyHours: 8,
  weeklyWorkHours: 48,
  gracePeriodMinutes: 15,
  overtimeRateStandard: 1.25,
  overtimeRateHoliday: 1.5,
  biometricIp: '',
  biometricPort: '',
  enableBiometricSync: false,

  indemnityFirst5YearsDays: 15,
  indemnitySubsequentYearsDays: 30,
  indemnityMaxCapMonths: 18,
  applyResignationTiersArticle53: true,
  includeAllowancesInIndemnity: true,
  workingDaysPerMonthDivisor: 26,

  geminiApiKey: '',
  ocrEngineMode: 'cloud_server',
  autoExtractDocuments: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpUser: '',
  smtpPass: '',
  enableAiAssistant: true,
};

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  isSaving: boolean;
  isLoading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeCompany, updateActiveCompany } = useCompany();
  const { user } = useAuth();
  const activeCompanyId = activeCompany?.id || 'default_settings';

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void loadCompanySettings(activeCompanyId, activeCompany)
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      })
      .catch((e) => {
        console.error('Error loading company settings:', e);
        if (!cancelled) {
          toast.error('تعذر تحميل إعدادات المنشأة من السحابة — تم استخدام النسخة المحلية المؤقتة إن وُجدت.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCompanyId, activeCompany?.id, activeCompany?.nameAr]);

  const syncCompanyProfile = (patch: Partial<SystemSettings>) => {
    if (
      patch.companyNameAr ||
      patch.companyNameEn ||
      patch.crNumber ||
      patch.pifssNumber ||
      patch.mohLicense ||
      patch.bankName ||
      patch.iban ||
      patch.logo
    ) {
      updateActiveCompany({
        nameAr: patch.companyNameAr,
        nameEn: patch.companyNameEn,
        name: patch.companyNameAr,
        crNumber: patch.crNumber,
        commercialRegNo: patch.crNumber,
        pifssNumber: patch.pifssNumber,
        mohLicense: patch.mohLicense,
        bankName: patch.bankName,
        iban: patch.iban,
        logo: patch.logo,
      });
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settingsRef.current, ...newSettings };
    setSettings(updated);
    setIsSaving(true);
    syncCompanyProfile(newSettings);

    void saveCompanySettings(activeCompanyId, updated, { updatedBy: user?.email || undefined })
      .catch((e) => {
        console.error('Error saving company settings:', e);
        toast.error('فشل حفظ الإعدادات في Firestore — تحقق من الاتصال والصلاحيات.');
      })
      .finally(() => {
        setTimeout(() => setIsSaving(false), 400);
      });
  };

  const resetSettings = () => {
    const profileMerged = {
      ...defaultSettings,
      companyNameAr: activeCompany?.nameAr || '',
      companyNameEn: activeCompany?.nameEn || '',
      crNumber: activeCompany?.crNumber || activeCompany?.commercialRegNo || '',
    };
    setSettings(profileMerged);
    setIsSaving(true);
    void saveCompanySettings(activeCompanyId, profileMerged, { updatedBy: user?.email || undefined })
      .catch((e) => console.error('Error resetting settings:', e))
      .finally(() => setIsSaving(false));
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSettings, resetSettings, isSaving, isLoading }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      resetSettings: () => {},
      isSaving: false,
      isLoading: false,
    };
  }
  return context;
};
