import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCompany } from './CompanyContext';

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

  // 3. إعدادات الإجازات ومحرك التراكم
  monthlyAccrualRate: number; // 2.5 يوم شهرياً
  unpaidLeaveFreezesAccrual: boolean; // إيقاف عداد الرصيد تلقائياً في الإجازات غير المدفوعة
  unpaidLeaveExcludesService: boolean; // استبعاد الإجازة غير المدفوعة من مدة الخدمة الفعلية
  maxCarryoverDays: number; // الحد الأقصى لتراكم الإجازات
  enableAdvanceLeaveSalary: boolean; // صرف بدل الإجازة مقدماً وفق المادة 71

  // 4. إعدادات الدوام والبصمة
  standardDailyHours: number; // 8 ساعات
  weeklyWorkHours: number; // 48 ساعة
  gracePeriodMinutes: number; // 15 دقيقة
  overtimeRateStandard: number; // 1.25x
  overtimeRateHoliday: number; // 1.50x
  biometricIp: string;
  biometricPort: string;
  enableBiometricSync: boolean;

  // 5. حاسبة نهاية الخدمة
  indemnityFirst5YearsDays: number; // 15 يوماً
  indemnitySubsequentYearsDays: number; // 30 يوماً
  indemnityMaxCapMonths: number; // 18 شهراً
  applyResignationTiersArticle53: boolean; // تطبيق المادة 53
  includeAllowancesInIndemnity: boolean; // احتساب الأجر الشامل
  workingDaysPerMonthDivisor: number; // 26 يوماً

  // 6. الذكاء الاصطناعي ومعالجة المستندات (AI, OCR & Integrations)
  geminiApiKey: string;
  ocrEngineMode: 'cloud_server' | 'direct_client';
  autoExtractDocuments: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  enableAiAssistant: boolean;
}

export const defaultSettings: SystemSettings = {
  // بيانات المنشأة
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

  // الرواتب و WPS
  pamId: '',
  bankName: '',
  bankCode: '',
  iban: '',
  branchCode: '',
  wpsCorporateId: '',
  workingDaysCalculation: '26_DAYS',
  enableWpsSif: true,
  salaryCutoffDay: 25,

  // الإجازات ومحرك التراكم
  monthlyAccrualRate: 2.5,
  unpaidLeaveFreezesAccrual: true,
  unpaidLeaveExcludesService: true,
  maxCarryoverDays: 60,
  enableAdvanceLeaveSalary: true,

  // الدوام والبصمة
  standardDailyHours: 8,
  weeklyWorkHours: 48,
  gracePeriodMinutes: 15,
  overtimeRateStandard: 1.25,
  overtimeRateHoliday: 1.5,
  biometricIp: '',
  biometricPort: '',
  enableBiometricSync: false,

  // نهاية الخدمة
  indemnityFirst5YearsDays: 15,
  indemnitySubsequentYearsDays: 30,
  indemnityMaxCapMonths: 18,
  applyResignationTiersArticle53: true,
  includeAllowancesInIndemnity: true,
  workingDaysPerMonthDivisor: 26,

  // الذكاء الاصطناعي و OCR و البريد
  geminiApiKey: localStorage.getItem('custom_gemini_key') || '',
  ocrEngineMode: 'cloud_server',
  autoExtractDocuments: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpUser: 'elsayedhr1993@gmail.com',
  enableAiAssistant: true,
};

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  isSaving: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'aysed_odoo_general_settings_';

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeCompany, updateActiveCompany } = useCompany();
  const activeCompanyId = activeCompany?.id || 'default_settings';

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeCompanyId}`);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    // دمج بيانات الشركة النشطة في الإعدادات الابتدائية
    return {
      ...defaultSettings,
      companyNameAr: activeCompany?.nameAr || defaultSettings.companyNameAr,
      companyNameEn: activeCompany?.nameEn || defaultSettings.companyNameEn,
      crNumber: activeCompany?.crNumber || activeCompany?.commercialRegNo || defaultSettings.crNumber,
      mohLicense: activeCompany?.mohLicense || defaultSettings.mohLicense,
      civilIdCompany: activeCompany?.civilIdCompany || defaultSettings.civilIdCompany,
      pifssNumber: activeCompany?.pifssNumber || defaultSettings.pifssNumber,
      bankName: activeCompany?.bankName || defaultSettings.bankName,
      iban: activeCompany?.iban || defaultSettings.iban,
      wpsCorporateId: activeCompany?.wsiCode || defaultSettings.wpsCorporateId,
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  // تحديث الإعدادات عند تبديل الشركة
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeCompanyId}`);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } else {
        setSettings((prev) => ({
          ...prev,
          companyNameAr: activeCompany?.nameAr || prev.companyNameAr,
          companyNameEn: activeCompany?.nameEn || prev.companyNameEn,
          crNumber: activeCompany?.crNumber || activeCompany?.commercialRegNo || prev.crNumber,
          mohLicense: activeCompany?.mohLicense || prev.mohLicense,
          civilIdCompany: activeCompany?.civilIdCompany || prev.civilIdCompany,
          pifssNumber: activeCompany?.pifssNumber || prev.pifssNumber,
          bankName: activeCompany?.bankName || prev.bankName,
          iban: activeCompany?.iban || prev.iban,
          wpsCorporateId: activeCompany?.wsiCode || prev.wpsCorporateId,
        }));
      }
    } catch (e) {
      console.error('Error switching company settings:', e);
    }
  }, [activeCompanyId, activeCompany]);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setIsSaving(true);
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${activeCompanyId}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving settings:', e);
      }
      return updated;
    });

    // مزامنة فورية ومباشرة لبيانات الشركة النشطة في CompanyContext و localStorage
    if (newSettings.geminiApiKey !== undefined) {
      localStorage.setItem('custom_gemini_key', newSettings.geminiApiKey);
      localStorage.setItem('custom_gemini_api_key', newSettings.geminiApiKey);
    }

    if (
      newSettings.companyNameAr ||
      newSettings.companyNameEn ||
      newSettings.crNumber ||
      newSettings.pifssNumber ||
      newSettings.mohLicense ||
      newSettings.bankName ||
      newSettings.iban ||
      newSettings.logo
    ) {
      updateActiveCompany({
        nameAr: newSettings.companyNameAr,
        nameEn: newSettings.companyNameEn,
        name: newSettings.companyNameAr,
        crNumber: newSettings.crNumber,
        commercialRegNo: newSettings.crNumber,
        pifssNumber: newSettings.pifssNumber,
        mohLicense: newSettings.mohLicense,
        bankName: newSettings.bankName,
        iban: newSettings.iban,
        logo: newSettings.logo
      });
    }

    setTimeout(() => setIsSaving(false), 500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${activeCompanyId}`, JSON.stringify(defaultSettings));
    } catch (e) {
      console.error('Error resetting settings:', e);
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSettings, resetSettings, isSaving }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      resetSettings: () => {},
      isSaving: false,
    };
  }
  return context;
};
