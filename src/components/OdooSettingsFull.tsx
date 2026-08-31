import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Share2, 
  Database, 
  ShieldCheck, 
  Palette, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  KeyRound, 
  DownloadCloud,
  Layers
} from 'lucide-react';

export const OdooSettingsFull: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'integrations' | 'backup' | 'security' | 'appearance'>('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    company_name_ar: 'مستوصف المنار كلينك',
    company_name_en: 'Al-Manar Clinic',
    commercial_reg_no: '107914',
    civil_id_org: '201934',
    pasi_number: 'KUW-884920',
    currency: 'KWD',
    official_email: 'hr@almanarclinic.com',
    phone: '+965 22000000',
    address: 'الكويت - حولي - شارع تونس',
    enable_kuwait_wps: true,
    wps_bank_code: 'KFH',
    enable_biometric_api: true,
    biometric_device_ip: '192.168.1.200',
    biometric_port: '4370',
    enable_email_smtp: true,
    smtp_host: 'smtp.resend.com',
    smtp_port: '587',
    smtp_user: 'notifications@almanarclinic.com',
    auto_backup_enabled: true,
    backup_frequency: 'daily',
    backup_time: '02:00',
    retain_backups_days: 30,
    export_format: 'sql_zip',
    enable_email_2fa: true,
    otp_expiry_minutes: 5,
    session_timeout_minutes: 60,
    enforce_strong_password: true,
    trust_device_days: 30,
    system_theme: 'light',
    primary_color: '#714B67',
    sidebar_style: 'odoo-compact',
    show_company_logo_on_print: true,
    header_margin_top: 48,
  });

  // جلب البيانات الفعلية عند فتح الشاشة
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (result.success && result.data) {
        setFormData(result.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage({ text: 'تم حفظ وتطبيق التغييرات بنجاح في النظام', type: 'success' });
      } else {
        setStatusMessage({ text: result.message || 'فشل في حفظ البيانات', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 font-sans dir-rtl" dir="rtl">
      {/* Control Panel Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">لوحة تحكم النظام العامة</div>
            <h1 className="text-xl font-bold text-gray-900">إدارة التهيئات والخصائص (Odoo HR Core)</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className={`flex items-center gap-1.5 text-sm font-bold ${
              statusMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {statusMessage.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-md font-bold text-sm shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex flex-col gap-1 h-fit">
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'company' ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-4 h-4" /> ملف وبيانات المنشأة
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'integrations' ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Share2 className="w-4 h-4" /> الربط والخدمات الخارجية
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'backup' ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-4 h-4" /> النسخ الاحتياطي والأتمتة
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> أمان الحساب وكلمات المرور
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'appearance' ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Palette className="w-4 h-4" /> المظهر والتخصيص
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Panel 1: Company Profile */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">ملف وبيانات المنشأة الرسمية</h2>
                <p className="text-xs text-gray-500">البيانات القانونية والمالية المعتمدة في ترويسات التقارير والشهادات.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المنشأة (بالعربية)</label>
                  <input
                    type="text"
                    value={formData.company_name_ar}
                    onChange={(e) => setFormData({ ...formData, company_name_ar: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#714B67] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Company Name (English)</label>
                  <input
                    type="text"
                    value={formData.company_name_en}
                    onChange={(e) => setFormData({ ...formData, company_name_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#714B67] outline-none font-semibold"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم ترخيص وزارة الصحة</label>
                  <input
                    type="text"
                    value={formData.commercial_reg_no}
                    onChange={(e) => setFormData({ ...formData, commercial_reg_no: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#714B67] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">الرقم المدني للجهة</label>
                  <input
                    type="text"
                    value={formData.civil_id_org}
                    onChange={(e) => setFormData({ ...formData, civil_id_org: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#714B67] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم ملف التأمينات (PIFSS)</label>
                  <input
                    type="text"
                    value={formData.pasi_number}
                    onChange={(e) => setFormData({ ...formData, pasi_number: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#714B67] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">العملة الأساسية</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm font-bold bg-white focus:border-[#714B67] outline-none"
                  >
                    <option value="KWD">دينار كويتي (KWD - د.ك)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">الربط والخدمات الخارجية (Integrations & APIs)</h2>
                <p className="text-xs text-gray-500">تكامل النظام مع بوابات تحويل الأجور وأجهزة البصمة وخوادم البريد.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-3 bg-gray-50">
                <input
                  type="checkbox"
                  id="wps"
                  checked={formData.enable_kuwait_wps}
                  onChange={(e) => setFormData({ ...formData, enable_kuwait_wps: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#714B67] rounded"
                />
                <div className="flex-1">
                  <label htmlFor="wps" className="font-bold text-sm text-gray-900 cursor-pointer">
                    تفعيل نظام حماية الأجور الكويتي (Kuwait WPS / MOSAL)
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">تصدير مسيرات الرواتب بملف SIF المصرفي المعتمد.</p>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="biometric"
                    checked={formData.enable_biometric_api}
                    onChange={(e) => setFormData({ ...formData, enable_biometric_api: e.target.checked })}
                    className="w-4 h-4 text-[#714B67] rounded"
                  />
                  <label htmlFor="biometric" className="font-bold text-sm text-gray-900 cursor-pointer">
                    ربط أجهزة الحضور والانصراف والبصمة (ZKTeco Biometric API)
                  </label>
                </div>

                {formData.enable_biometric_api && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">IP الجهاز المركزي</label>
                      <input
                        type="text"
                        value={formData.biometric_device_ip}
                        onChange={(e) => setFormData({ ...formData, biometric_device_ip: e.target.value })}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">المنفذ (Port)</label>
                      <input
                        type="text"
                        value={formData.biometric_port}
                        onChange={(e) => setFormData({ ...formData, biometric_port: e.target.value })}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel 3: Backup & Automation */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">النسخ الاحتياطي والأتمتة (Automated Backups)</h2>
                <p className="text-xs text-gray-500">جدولة أخذ نسخ احتياطية لقواعد البيانات ومستندات الموظفين وتنزيلها.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">النسخ الاحتياطي التلقائي المجدول</h3>
                    <p className="text-xs text-gray-500">تخزين النسخ الاحتياطية سحابياً بشكل دوري ومؤمن.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.auto_backup_enabled}
                    onChange={(e) => setFormData({ ...formData, auto_backup_enabled: e.target.checked })}
                    className="w-5 h-5 text-[#714B67] rounded"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">دورية النسخ الاحتياطي</label>
                    <select
                      value={formData.backup_frequency}
                      onChange={(e) => setFormData({ ...formData, backup_frequency: e.target.value })}
                      className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                    >
                      <option value="daily">يومياً (عند منتصف الليل)</option>
                      <option value="weekly">أسبوعياً (كل يوم جمعة)</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاحتفاظ بالنسخ لمدة</label>
                    <select
                      value={formData.retain_backups_days}
                      onChange={(e) => setFormData({ ...formData, retain_backups_days: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                    >
                      <option value={15}>15 يوماً</option>
                      <option value={30}>30 يوماً</option>
                      <option value={90}>3 أشهر</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="/api/settings/backup/download"
                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded text-xs font-bold transition"
                  >
                    <DownloadCloud className="w-4 h-4" /> تنزيل نسخة احتياطية فورية (SQL Dump)
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Panel 4: Security & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">أمان الحساب وكلمات المرور (Security & 2FA)</h2>
                <p className="text-xs text-gray-500">حماية تسجيل الدخول، المصادقة الثنائية وسياسات الجلسات.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-md">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">المصادقة الثنائية عبر الإيميل (Email 2FA / OTP)</h3>
                      <p className="text-xs text-gray-500">إرسال رمز تحقق مكون من 6 أرقام للإيميل عند كل محاولة تسجيل دخول جديدة.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enable_email_2fa}
                    onChange={(e) => setFormData({ ...formData, enable_email_2fa: e.target.checked })}
                    className="w-5 h-5 text-[#714B67] rounded"
                  />
                </div>

                {formData.enable_email_2fa && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">صلاحية رمز التحقق (بالدقائق)</label>
                      <input
                        type="number"
                        value={formData.otp_expiry_minutes}
                        onChange={(e) => setFormData({ ...formData, otp_expiry_minutes: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">تذكر الجهاز الموثوق به (أيام)</label>
                      <input
                        type="number"
                        value={formData.trust_device_days}
                        onChange={(e) => setFormData({ ...formData, trust_device_days: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">إنهاء الجلسة التلقائي عند الخمول</h3>
                  <p className="text-xs text-gray-500">تسجيل الخروج تلقائياً لحماية الحساب عند عدم وجود نشاط.</p>
                </div>
                <select
                  value={formData.session_timeout_minutes}
                  onChange={(e) => setFormData({ ...formData, session_timeout_minutes: Number(e.target.value) })}
                  className="border border-gray-300 rounded p-1.5 text-xs font-semibold bg-white"
                >
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={60}>ساعة واحدة</option>
                </select>
              </div>
            </div>
          )}

          {/* Panel 5: Appearance & Print Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-gray-900">المظهر والتخصيص (Theme & Print Layouts)</h2>
                <p className="text-xs text-gray-500">ألوان النظام وضبط هوامش أوراق الطباعة والتقارير الرسمية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اللون الرئيسي للواجهة (Primary Theme)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono font-bold text-gray-700">{formData.primary_color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">مسافة الهامش العلوي للطباعة الرسمية (Top Margin)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.header_margin_top}
                      onChange={(e) => setFormData({ ...formData, header_margin_top: Number(e.target.value) })}
                      className="w-24 border border-gray-300 rounded p-2 text-sm font-bold"
                    />
                    <span className="text-xs text-gray-500 font-semibold">ملم (لتجنب التداخل مع لوجو ورق الشركة)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OdooSettingsFull;
