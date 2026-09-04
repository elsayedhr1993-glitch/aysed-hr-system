import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CreditCard, 
  CalendarDays, 
  Clock, 
  Scale, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Upload, 
  Sliders, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles,
  Info,
  Mail,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useSystemSettings, SystemSettings } from '../context/SystemSettingsContext';
import { useCompany } from '../context/CompanyContext';
import { toast } from 'react-hot-toast';

export const OdooSettingsFull: React.FC = () => {
  const { settings, updateSettings, resetSettings, isSaving } = useSystemSettings();
  const { activeCompany, updateActiveCompany } = useCompany();

  const [activeSection, setActiveSection] = useState<string>('company');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Local state for editing form
  const [formData, setFormData] = useState<SystemSettings>(settings);

  // Synchronize when settings change from external source
  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  const handleFieldChange = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    const targetEmail = formData.email || 'elsayedhr1993@gmail.com';
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: 'اختبار خادم البريد (Aysed S HR 2026) - تهيئة أودو',
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort,
          smtpUser: formData.smtpUser,
          smtpPass: formData.smtpPass,
          text: `هذه رسالة اختبار للتأكد من ربط خادم البريد والمزامنة في المنشأة ${formData.companyNameAr}.`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #714B67; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">نجاح الاتصال والتحقق السحابي!</h2>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">مرحباً،</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">هذه رسالة اختبار تلقائية من <strong>نظام إعدادات أودو للموارد البشرية (Aysed S HR 2026)</strong>.</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">تم التحقق من ربط وتكامل خادم البريد الإلكتروني SMTP بنجاح للمنشأة: <strong style="color: #0f172a;">${formData.companyNameAr || 'الفنار كلينك'}</strong></p>
              
              <div style="margin-top: 25px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                <strong>بيانات التكوين والربط الفني:</strong><br />
                • خادم الصادر SMTP: <span style="font-family: monospace;">${formData.smtpHost || 'smtp.gmail.com'}</span><br />
                • المنفذ المعتمد: <span style="font-family: monospace;">${formData.smtpPort || 465}</span><br />
                • بريد الإرسال النشط: <span style="font-family: monospace;">${formData.smtpUser || targetEmail}</span>
              </div>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center;">نظام Aysed S HR 2026 &copy; ${new Date().getFullYear()} - جميع الحقوق محفوظة.</p>
            </div>
          `
        })
      });

      const text = await response.text();
      let data;
      try { 
        data = JSON.parse(text); 
      } catch(e) { 
        console.error("Invalid JSON from server:", text);
        const truncatedText = text.substring(0, 150) + (text.length > 150 ? '...' : '');
        throw new Error(`الخادم لم يرجع استجابة JSON صالحة. محتوى الاستجابة: "${truncatedText}". يرجى التحقق من استجابة خادم البريد وسرعة اتصاله.`); 
      }
      
      if (data.success) {
        toast.success(`تم إرسال بريد الاختبار بنجاح إلى: ${targetEmail}`);
      } else {
        toast.error(`فشل الإرسال: ${data.error || 'حدث خطأ في الاتصال بالخادم.'}`);
      }
    } catch (error: any) {
      toast.error(`خطأ فني: ${error.message || 'فشل الاتصال بالخادم لإجراء الفحص.'}`);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleSave = () => {
    // 1. Update settings
    updateSettings(formData);

    // 2. Direct reactive synchronization of active company state and storage
    updateActiveCompany({
      nameAr: formData.companyNameAr,
      nameEn: formData.companyNameEn,
      name: formData.companyNameAr,
      crNumber: formData.crNumber,
      commercialRegNo: formData.crNumber,
      pifssNumber: formData.pifssNumber,
      mohLicense: formData.mohLicense,
      bankName: formData.bankName,
      iban: formData.iban,
      logo: formData.logo
    });

    toast.success('تم حفظ وتحديث بيانات المنشأة ومزامنتها في الشريط العلوي بنجاح');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleFieldChange('logo', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // تعريف أقسام الإعدادات
  const sections = [
    { id: 'company', label: 'بيانات المنشأة والترخيص', icon: Building2, subtitle: 'الاسم، التراخيص، الشعار والعناوين الرسمية' },
    { id: 'payroll', label: 'الرواتب وبنك WPS', icon: CreditCard, subtitle: 'ملف الشؤون، البنك، الآيبان، ومعادلة 26 يوم' },
    { id: 'leaves', label: 'الإجازات ومحرك التراكم', icon: CalendarDays, subtitle: 'معدل 2.5 يوم، الإجازة غير المدفوعة، والمادة 71' },
    { id: 'attendance', label: 'الدوام وأجهزة البصمة', icon: Clock, subtitle: 'ساعات العمل، دقائق السماح، وإعدادات الربط' },
    { id: 'indemnity', label: 'حاسبة مكافأة نهاية الخدمة', icon: Scale, subtitle: 'المادتان 51 و 53، شرائح الاستقالة والبدلات' },
    { id: 'integrations', label: 'الذكاء الاصطناعي والربط سحابي', icon: Sparkles, subtitle: 'مفتاح Gemini API، محرك OCR، والبريد الإلكتروني' },
    { id: 'security', label: 'الأمان والنسخ الاحتياطي', icon: ShieldCheck, subtitle: 'الجلسات، النسخ السحابي، والتأمين' }
  ];

  // تصفية الأقسام بحسب البحث
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(s => 
      s.label.toLowerCase().includes(q) || 
      s.subtitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans dir-rtl pb-24" dir="rtl">
      
      {/* 1. Header (Odoo Enterprise Settings Top Bar) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">الإعدادات العامة للتهيئة والسياسات</h1>
              <span className="bg-purple-100 text-[#714B67] text-[11px] font-bold px-2 py-0.5 rounded-full">
                Odoo 18 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500">
              المنشأة النشطة: <span className="font-bold text-slate-700">{activeCompany?.nameAr || formData.companyNameAr}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Search Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تصفية الإعدادات والخيارات..."
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#714B67] text-xs rounded-lg py-1.5 pr-8 pl-3 outline-hidden transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            title="استعادة الإعدادات الافتراضية"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-95 ${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-black' 
                : 'bg-[#714B67] hover:bg-[#583a50] text-white'
            }`}
          >
            {isSaving ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={13} className="text-white animate-bounce" />
            ) : (
              <Save size={13} />
            )}
            <span>{saveSuccess ? 'تم الحفظ بنجاح ✓' : 'حفظ الإعدادات'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Layout (Sidebar + Settings Canvas) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-2 sticky top-24 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              أقسام الضبط والتهيئة
            </div>
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? 'bg-[#714B67] text-white font-bold shadow-xs' 
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                    <span className="text-xs truncate">{sec.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Canvas Area */}
        <div className="flex-1 space-y-6">

          {/* Section 1: Company Profile */}
          {(activeSection === 'company' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-[#714B67] rounded-lg">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">بيانات المنشأة والترخيص (Company Profile)</h2>
                    <p className="text-[11px] text-slate-500">تستخدم هذه البيانات في ترويسة الكتب الرسمية، الشهادات، ونماذج الرواتب.</p>
                  </div>
                </div>
              </div>

              {/* Logo & Basic Info */}
              <div className="flex flex-col sm:flex-row items-start gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-2xs relative group">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="text-center p-2">
                        <Building2 size={28} className="mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-400 block font-medium">شعار المنشأة</span>
                      </div>
                    )}
                  </div>
                  <label className="text-[11px] font-bold text-[#714B67] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>تغيير الشعار</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة (بالعربية) *</label>
                    <input
                      type="text"
                      value={formData.companyNameAr}
                      onChange={(e) => handleFieldChange('companyNameAr', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name (English)</label>
                    <input
                      type="text"
                      value={formData.companyNameEn}
                      onChange={(e) => handleFieldChange('companyNameEn', e.target.value)}
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم ترخيص وزارة الصحة (MOH License) *</label>
                    <input
                      type="text"
                      value={formData.mohLicense}
                      onChange={(e) => handleFieldChange('mohLicense', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الرقم المدني للجهة (Civil ID Org)</label>
                    <input
                      type="text"
                      value={formData.civilIdCompany}
                      onChange={(e) => handleFieldChange('civilIdCompany', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Extended Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم السجل التجاري (CR No)</label>
                  <input
                    type="text"
                    value={formData.crNumber}
                    onChange={(e) => handleFieldChange('crNumber', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم ملف التأمينات (PIFSS)</label>
                  <input
                    type="text"
                    value={formData.pifssNumber}
                    onChange={(e) => handleFieldChange('pifssNumber', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العملة الافتراضية</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden"
                  >
                    <option value="KWD">دينار كويتي (0.000 KWD)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الرسمي المعتمد</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="الهاتف"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للمنشأة</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Payroll & WPS */}
          {(activeSection === 'payroll' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">إعدادات الرواتب وبنك WPS (Kuwait Payroll & MOSAL)</h2>
                    <p className="text-[11px] text-slate-500">تهيئة نظام حماية الأجور وتحويل الرواتب البنكية وملفات SIF المعتمدة.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم ملف الشؤون / القوى العاملة (PAM ID) *</label>
                  <input
                    type="text"
                    value={formData.pamId}
                    onChange={(e) => handleFieldChange('pamId', e.target.value)}
                    placeholder="مثال: PAM-994821"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">المسجل لدى الهيئة العامة للقوى العاملة.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود المنشأة التعريفي لدى البنك (WPS Corporate ID)</label>
                  <input
                    type="text"
                    value={formData.wpsCorporateId}
                    onChange={(e) => handleFieldChange('wpsCorporateId', e.target.value)}
                    placeholder="مثال: WSI-ALMANAR"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بنك المنشأة المعتمد لتحويل الرواتب</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleFieldChange('bankName', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الآيبان (IBAN) للتحويلات</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleFieldChange('iban', e.target.value)}
                    dir="ltr"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden"
                  />
                </div>
              </div>

              {/* Working Days Policy */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-700" />
                  <h3 className="text-xs font-bold text-emerald-900">معادلة احتساب أيام العمل وأجر اليوم</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    formData.workingDaysCalculation === '26_DAYS' ? 'bg-white border-emerald-500 shadow-2xs' : 'bg-transparent border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="workingDaysCalculation"
                      checked={formData.workingDaysCalculation === '26_DAYS'}
                      onChange={() => handleFieldChange('workingDaysCalculation', '26_DAYS')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">معادلة 26 يوماً (المعتمدة قانوناً بالكويت)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">قسمة الراتب على 26 يوماً لاحتساب أجر اليوم وساعات العمل الإضافي.</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    formData.workingDaysCalculation === '30_DAYS' ? 'bg-white border-emerald-500 shadow-2xs' : 'bg-transparent border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="workingDaysCalculation"
                      checked={formData.workingDaysCalculation === '30_DAYS'}
                      onChange={() => handleFieldChange('workingDaysCalculation', '30_DAYS')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">معادلة 30 يوماً (أيام الشهر التقويمي)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">قسمة الراتب على 30 يوماً لكافة الأشهر.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Time Off & Accrual Engine */}
          {(activeSection === 'leaves' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">إعدادات الإجازات ومحرك التراكم (Accrual Engine)</h2>
                    <p className="text-[11px] text-slate-500">قواعد الرصيد السنوي، استحقاق الموظفين، والإجازات غير المدفوعة.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">معدل التراكم الشهري للإجازة السنوية (أيام / شهر) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.monthlyAccrualRate}
                      onChange={(e) => handleFieldChange('monthlyAccrualRate', parseFloat(e.target.value) || 2.5)}
                      className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden font-mono"
                    />
                    <span className="text-xs text-slate-600 font-medium">يوم شهرياً (= 30 يوماً سنوياً وفق مادة 70)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأقصى لتراكم الإجازات السنوية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.maxCarryoverDays}
                      onChange={(e) => handleFieldChange('maxCarryoverDays', parseInt(e.target.value) || 60)}
                      className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden font-mono"
                    />
                    <span className="text-xs text-slate-600 font-medium">يوم (حد السقف للترحيل السنوي)</span>
                  </div>
                </div>
              </div>

              {/* Unpaid leave policy */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Info size={14} className="text-teal-600" />
                  <span>سياسة الإجازات غير المدفوعة وقانون العمل الكويتي:</span>
                </div>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.unpaidLeaveFreezesAccrual}
                    onChange={(e) => handleFieldChange('unpaidLeaveFreezesAccrual', e.target.checked)}
                    className="mt-0.5 text-[#714B67] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">إيقاف عداد رصيد الإجازات تلقائياً أثناء الإجازات غير المدفوعة</div>
                    <div className="text-[10px] text-slate-500">لا يتم احتساب الـ 2.5 يوم شهرياً عن أي فترة إجازة بدون راتب.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.unpaidLeaveExcludesService}
                    onChange={(e) => handleFieldChange('unpaidLeaveExcludesService', e.target.checked)}
                    className="mt-0.5 text-[#714B67] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">استبعاد مدد الإجازات غير المدفوعة من سنوات الخدمة الفعلية</div>
                    <div className="text-[10px] text-slate-500">يتم خصم أيام الإجازة بدون راتب من حساب مكافأة نهاية الخدمة وتاريخ الاستحقاق.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableAdvanceLeaveSalary}
                    onChange={(e) => handleFieldChange('enableAdvanceLeaveSalary', e.target.checked)}
                    className="mt-0.5 text-[#714B67] rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">صرف مستحقات الإجازة مقدماً قبل القيام بها (المادة 71)</div>
                    <div className="text-[10px] text-slate-500">إلزام صرف راتب فترة الإجازة السنوية وتذكرة السفر مقدماً مع كشف التسوية.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Section 4: Attendance & Biometrics */}
          {(activeSection === 'attendance' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">إعدادات الدوام وأجهزة البصمة (Attendance & Biometrics)</h2>
                    <p className="text-[11px] text-slate-500">ساعات الدوام اليومي، دقائق السماح، والاتصال بأجهزة البصمة.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ساعات العمل اليومية القياسية</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.standardDailyHours}
                      onChange={(e) => handleFieldChange('standardDailyHours', parseInt(e.target.value) || 8)}
                      className="w-24 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden font-mono"
                    />
                    <span className="text-xs text-slate-600">ساعات / يوم</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دقائق السماح الافتراضية للتأخير *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.gracePeriodMinutes}
                      onChange={(e) => handleFieldChange('gracePeriodMinutes', parseInt(e.target.value) || 15)}
                      className="w-24 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden font-mono"
                    />
                    <span className="text-xs text-slate-600">دقيقة سماح</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">معامل العمل الإضافي (الأيام العادية)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.05"
                      value={formData.overtimeRateStandard}
                      onChange={(e) => handleFieldChange('overtimeRateStandard', parseFloat(e.target.value) || 1.25)}
                      className="w-24 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#714B67] outline-hidden font-mono"
                    />
                    <span className="text-xs text-slate-600">× الأجر الأساسي</span>
                  </div>
                </div>
              </div>

              {/* Biometric Device Integration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ربط أجهزة البصمة (ZKTeco / Hikvision & Cloud ADMS Push):
                  </div>
                  <span className="text-[10px] bg-[#714B67]/10 text-[#714B67] font-bold px-2.5 py-1 rounded-md">
                    Odoo Cloud Attendance Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان IP الخاص بجهاز البصمة (محلي)</label>
                    <input
                      type="text"
                      value={formData.biometricIp}
                      onChange={(e) => handleFieldChange('biometricIp', e.target.value)}
                      placeholder="192.168.1.200"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">منفذ الاتصال (Port)</label>
                    <input
                      type="text"
                      value={formData.biometricPort}
                      onChange={(e) => handleFieldChange('biometricPort', e.target.value)}
                      placeholder="4370"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden"
                    />
                  </div>
                </div>

                {/* ADMS Cloud Push Configuration Box */}
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    🌐 إعدادات الاتصال السحابي المباشر (ADMS / Push Server URL):
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    قم بإدخال الرابط التالي في إعدادات جهاز البصمة (ADMS / Cloud Server Settings) في فروعك الخارجية، وسيقوم النظام باستقبال الحركات وتسكينها تلقائياً مع عزل الشركات:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/iclock/cdata`}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-indigo-600 font-bold select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/iclock/cdata`);
                        toast.success('تم نسخ رابط السيرفر السحابي بنجاح');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                    >
                      نسخ الرابط
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Indemnity / End of Service */}
          {(activeSection === 'indemnity' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">حاسبة مكافأة نهاية الخدمة (Kuwait Labor Law Articles 51 & 53)</h2>
                    <p className="text-[11px] text-slate-500">تطبيق بنود قانون العمل في القطاع الأهلي الكويتي بدقة متناهية.</p>
                  </div>
                </div>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
                  <div className="text-xs font-bold text-amber-950 mb-1">السنوات الـ 5 الأولى</div>
                  <div className="text-sm font-bold text-amber-900 font-mono">15 يوماً / سنة</div>
                  <div className="text-[10px] text-slate-500 mt-1">تطبيق المادة 51 للمعينين بالمشاهرة.</div>
                </div>

                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
                  <div className="text-xs font-bold text-amber-950 mb-1">السنوات التالية (بعد 5 سنوات)</div>
                  <div className="text-sm font-bold text-amber-900 font-mono">30 يوماً (شهر كامل) / سنة</div>
                  <div className="text-[10px] text-slate-500 mt-1">عن كل سنة خدمة بعد الخمس سنوات الأولى.</div>
                </div>

                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
                  <div className="text-xs font-bold text-amber-950 mb-1">الحد الأقصى للمكافأة</div>
                  <div className="text-sm font-bold text-amber-900 font-mono">18 شهراً (سنة ونصف)</div>
                  <div className="text-[10px] text-slate-500 mt-1">سقف الحد الأقصى للمكافأة الإجمالية.</div>
                </div>
              </div>

              {/* Article 53 resignation tiers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900">شرائح الاستقالة وفق المادة 53:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">أقل من 3 سنوات</div>
                    <div className="font-bold text-rose-600 mt-0.5">0% (لا يستحق)</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">من 3 إلى 5 سنوات</div>
                    <div className="font-bold text-amber-600 mt-0.5">50% (نصف المكافأة)</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">من 5 إلى 10 سنوات</div>
                    <div className="font-bold text-blue-600 mt-0.5">66.66% (ثلثي المكافأة)</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">10 سنوات فأكثر</div>
                    <div className="font-bold text-emerald-600 mt-0.5">100% (المكافأة كاملة)</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeAllowancesInIndemnity}
                    onChange={(e) => handleFieldChange('includeAllowancesInIndemnity', e.target.checked)}
                    className="text-[#714B67] rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    احتساب البدلات الثابتة (السكن، الانتقال) ضمن الأجر الشامل لاحتساب نهاية الخدمة
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Section 7: الذكاء الاصطناعي والربط سحابي (AI & Integrations) */}
          {(activeSection === 'integrations' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-[#714B67] rounded-lg">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">الذكاء الاصطناعي ومعالجة المستندات (AI & Integrations)</h2>
                    <p className="text-[11px] text-slate-500">تفعيل خدمات الذكاء الاصطناعي، مفاتيح الربط، وأتمتة مسح المستندات وعقد الصادر.</p>
                  </div>
                </div>
              </div>

              {/* 1. Gemini Engine Settings */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#714B67]" />
                    <span>محرك الذكاء الاصطناعي (Google Gemini AI Engine)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    formData.geminiApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {formData.geminiApiKey ? 'مُتصل ونشط' : 'غير مضبوط (يستخدم السيرفر)'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">مفتاح API الخاص بـ Gemini (Gemini API Key)</label>
                      <a 
                        href="https://aistudio.google.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 font-bold animate-pulse"
                      >
                        <span>الحصول على مفتاح مجاني</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={formData.geminiApiKey || ''}
                        onChange={(e) => handleFieldChange('geminiApiKey', e.target.value)}
                        placeholder="AIzaSy..."
                        dir="ltr"
                        className="w-full bg-white border border-slate-300 rounded-lg pr-9 pl-10 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      عند إدخال مفتاحك الخاص، سيقوم النظام بتشغيل عمليات تحليل صور الهويات المدنية والرخص مباشرة من متصفحك (Client-Side OCR) بسرعة خارقة وبدون التعراض لقيود المهلة السحابية (Vercel Timeout 10s).
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Document Extraction Engine Mode */}
              <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/60 space-y-3">
                <div className="text-xs font-bold text-[#714B67] flex items-center gap-1.5">
                  <Sliders size={14} />
                  <span>وضع محرك القراءة الضوئية واستخراج البيانات (OCR Mode)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    formData.ocrEngineMode === 'cloud_server' ? 'bg-white border-[#714B67] shadow-2xs' : 'bg-transparent border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="ocrEngineMode"
                      checked={formData.ocrEngineMode === 'cloud_server'}
                      onChange={() => handleFieldChange('ocrEngineMode', 'cloud_server')}
                      className="mt-0.5 text-[#714B67]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">سيرفر معالجة السحابة الآمنة (Cloud Server)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">استخدام السيرفر المركزي لمعالجة المستندات وحفظ البيانات بسرية تامة.</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition ${
                    formData.ocrEngineMode === 'direct_client' ? 'bg-white border-[#714B67] shadow-2xs' : 'bg-transparent border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="ocrEngineMode"
                      checked={formData.ocrEngineMode === 'direct_client'}
                      onChange={() => handleFieldChange('ocrEngineMode', 'direct_client')}
                      className="mt-0.5 text-[#714B67]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">العميل المباشر فائق السرعة (Direct Client)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ربط مباشر بمتصفح العميل يتجاوز أي فترات توقف سحابية ويستخرج البيانات بثانية واحدة.</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t border-purple-200/40">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoExtractDocuments}
                      onChange={(e) => handleFieldChange('autoExtractDocuments', e.target.checked)}
                      className="text-[#714B67] rounded mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">المسح التلقائي الفوري للمستندات عند رفعها</span>
                      <span className="text-[10px] text-slate-500">قراءة وتفكيك البطاقة المدنية، رخصة وزارة الصحة، أو الجواز تلقائياً وتعبئة سجل الموظف الجديد دون تدخل بشري.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableAiAssistant}
                      onChange={(e) => handleFieldChange('enableAiAssistant', e.target.checked)}
                      className="text-[#714B67] rounded mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">تفعيل المستشار المساعد للمنظومة (Copilot Assistant)</span>
                      <span className="text-[10px] text-slate-500">تقديم اقتراحات لتصميم قوالب الشفتات والتحذير من انتهاء الإقامات أو تعارض الدوامات.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. SMTP Mail Gateway Configuration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-600" />
                    <span>بوابة صادر البريد الإلكتروني والمراسلات (SMTP Mail Gateway)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                    Odoo Mail Exchange
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">خادم SMTP (SMTP Server Address)</label>
                    <input
                      type="text"
                      value={formData.smtpHost || ''}
                      onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المنفذ المعتمد (SMTP Port)</label>
                    <input
                      type="number"
                      value={formData.smtpPort || 465}
                      onChange={(e) => handleFieldChange('smtpPort', parseInt(e.target.value) || 465)}
                      placeholder="465"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للربط والتوثيق</label>
                    <input
                      type="email"
                      value={formData.smtpUser || ''}
                      onChange={(e) => handleFieldChange('smtpUser', e.target.value)}
                      placeholder="elsayedhr1993@gmail.com"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الرقم السري أو رمز التطبيق (SMTP Pass)</label>
                    <input
                      type="password"
                      value={formData.smtpPass || ''}
                      onChange={(e) => handleFieldChange('smtpPass', e.target.value)}
                      placeholder="••••••••••••••••"
                      dir="ltr"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#714B67] outline-hidden shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-slate-500 max-w-md leading-normal">
                    تُستعمل هذه التهيئة لإبلاغ الموظفين بقرارات الإجازات والرواتب وتقرير الشفتات الشهري تلقائياً عبر البريد الإلكتروني.
                  </p>
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={isTestingSmtp}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>جاري إرسال الاختبار...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={13} />
                        <span>اختبار اتصال البريد الإلكتروني</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Backup & Security */}
          {(activeSection === 'security' || searchQuery) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">الأمان والنسخ الاحتياطي (System Security & Backups)</h2>
                    <p className="text-[11px] text-slate-500">حماية البيانات، أمان الجلسات، وسجلات التدقيق.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">تشفير وحماية البيانات النشطة</div>
                    <div className="text-[11px] text-emerald-700">نظام عزل الشركات (Multi-tenant SaaS) مفعل ويعمل بأعلى معايير الأمان.</div>
                  </div>
                </div>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  نشط 100%
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
