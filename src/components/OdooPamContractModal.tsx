import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  User,
  Calendar,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { 
  PamContractData, 
  DEFAULT_PAM_COORDINATES, 
  generatePamContractBlob, 
  downloadPamContractPdf, 
  printPamContractPdf,
  PamCoordinatesConfig,
  PamFontChoice
} from '../services/pamContractPdfService';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  company?: any;
}

// Arabic day names lookup
const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const OdooPamContractModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employee,
  company
}) => {
  const today = useMemo(() => new Date(), []);
  const todayDayAr = ARABIC_DAYS[today.getDay()];
  const todayDayEn = ENGLISH_DAYS[today.getDay()];
  const todayDateStr = today.toISOString().slice(0, 10).replace(/-/g, '/');

  // Form State initialized with employee and company data
  const [formData, setFormData] = useState<PamContractData>({
    companyLaborDept: 'حولي',
    companyLaborDeptEn: 'Hawalli',
    contractDay: todayDayAr,
    contractDayEn: todayDayEn,
    contractDate: todayDateStr,

    companyName: '',
    companyNameEn: '',
    companyRepName: '',
    companyRepNameEn: '',
    companyRepCivilId: '',
    companyField: 'الرعاية والخدمات الطبية والصحية',
    companyFieldEn: 'Healthcare & Medical Services',

    employeeNameAr: '',
    employeeNameEn: '',
    employeeNationality: 'كويتي',
    employeeNationalityEn: 'Kuwaiti',
    employeeCivilId: '',
    employeeResidence: 'مادة 18 - حولي',
    employeeResidenceEn: 'Article 18 - Hawalli',

    jobTitleAr: '',
    jobTitleEn: '',
    basicSalary: '500',
    salaryPeriod: 'شهر ميلادي',
    salaryPeriodEn: 'Month',

    effectiveDate: todayDateStr,
    durationYears: '3',
    leaveDay: '30'
  });

  const [coords, setCoords] = useState<PamCoordinatesConfig>(DEFAULT_PAM_COORDINATES);
  const [fontChoice, setFontChoice] = useState<PamFontChoice>('cairo');
  const [showCoordsCalibrator, setShowCoordsCalibrator] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('preview');

  // Update initial data when employee or company changes
  useEffect(() => {
    if (!employee && !company) return;

    const compName = company?.name || company?.nameAr || 'شركة الرعاية الطبية المتقدمة ذ.م.م';
    const compNameEn = company?.nameEn || 'Advanced Medical Care Co. W.L.L';
    const compRep = company?.authorizedSignatory || company?.managerName || 'أحمد محمد الكندري';
    const compRepEn = company?.managerNameEn || 'Ahmed M. Al-Kandari';
    const compRepCivil = company?.signatoryCivilId || company?.civilId || '285010101234';
    const compField = company?.commercialActivity || company?.activity || 'الرعاية والخدمات الطبية والصحية';
    const compFieldEn = company?.activityEn || 'Healthcare & Medical Services';
    const laborDept = company?.laborDepartment || 'حولي';

    const empNameAr = employee?.name || employee?.fullNameAr || employee?.fullName || '';
    const empNameEn = employee?.nameEn || employee?.fullNameEn || '';
    const empNationality = employee?.nationality || 'مصري';
    const empCivil = employee?.civilId || '';
    const empResidence = employee?.address || employee?.residencyArticle ? `مادة ${employee?.residencyArticle || '18'} - ${employee?.address || 'حولي'}` : 'مادة 18 - حولي';
    const empResidenceEn = `Article ${employee?.residencyArticle || '18'} - Hawalli`;
    const empJobAr = employee?.jobTitle || employee?.position || employee?.department || 'طبيب بشري عام';
    const empJobEn = employee?.jobTitleEn || 'General Practitioner';
    const empSalary = String(employee?.salary || employee?.basicWage || employee?.wage || '650');
    const empHireDate = employee?.hireDate || employee?.joiningDate || todayDateStr;

    setFormData(prev => ({
      ...prev,
      companyLaborDept: laborDept,
      companyLaborDeptEn: laborDept === 'حولي' ? 'Hawalli' : laborDept === 'العاصمة' ? 'Capital' : laborDept,
      companyName: compName,
      companyNameEn: compNameEn,
      companyRepName: compRep,
      companyRepNameEn: compRepEn,
      companyRepCivilId: compRepCivil,
      companyField: compField,
      companyFieldEn: compFieldEn,
      employeeNameAr: empNameAr,
      employeeNameEn: empNameEn,
      employeeNationality: empNationality,
      employeeNationalityEn: empNationality === 'مصري' ? 'Egyptian' : empNationality === 'كويتي' ? 'Kuwaiti' : empNationality === 'هندي' ? 'Indian' : empNationality,
      employeeCivilId: empCivil,
      employeeResidence: empResidence,
      employeeResidenceEn: empResidenceEn,
      jobTitleAr: empJobAr,
      jobTitleEn: empJobEn,
      basicSalary: empSalary,
      effectiveDate: empHireDate ? String(empHireDate).replace(/-/g, '/') : todayDateStr
    }));
  }, [employee, company, todayDateStr]);

  // Generate PDF preview whenever form data, coords, or font change
  const refreshPreview = async (selectedFont: PamFontChoice = fontChoice) => {
    setIsGenerating(true);
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const { url } = await generatePamContractBlob(formData, coords, selectedFont);
      setPreviewUrl(url);
    } catch (err: any) {
      console.error('Error generating preview:', err);
      toast.error(`تعذر توليد المعاينة: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFontChange = (newFont: PamFontChoice) => {
    setFontChoice(newFont);
    refreshPreview(newFont);
  };

  // Initial preview generation on open
  useEffect(() => {
    if (isOpen) {
      refreshPreview(fontChoice);
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      toast.loading('جاري تجهيز وتحميل ملف عقد العمل الحكومي...', { id: 'pam-dl' });
      await downloadPamContractPdf(
        formData, 
        `PAM_Form2_${formData.employeeNameAr || formData.employeeNameEn || 'Contract'}.pdf`,
        coords,
        fontChoice
      );
      toast.success('تم تحميل العقد الحكومي بنجاح!', { id: 'pam-dl' });
    } catch (err: any) {
      toast.error(`فشل التحميل: ${err.message}`, { id: 'pam-dl' });
    }
  };

  const handlePrint = async () => {
    try {
      toast.loading('جاري إرسال العقد لأمر الطباعة...', { id: 'pam-print' });
      await printPamContractPdf(formData, coords, fontChoice);
      toast.success('تم إرسال أمر الطباعة!', { id: 'pam-print' });
    } catch (err: any) {
      toast.error(`فشل الطباعة: ${err.message}`, { id: 'pam-print' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 dir-rtl text-slate-800 text-xs select-none" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#714B67] to-[#593951] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-wide">عقد نموذج (2) - الهيئة العامة للقوى العاملة (PAM Form 2)</h3>
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> PDF Overlay طبق الأصل 100%
                </span>
              </div>
              <p className="text-[11px] text-white/80">نموذج عقد عمل إسترشادي في القطاع الأهلي بدولة الكويت - طباعة وتعبئة آلية متوافقة مع قانون العمل 6/2010</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'preview' ? 'form' : 'preview')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {activeTab === 'preview' ? 'تعديل البيانات' : 'معاينة العقد'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Printer size={15} /> طباعة فورية
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Download size={15} /> تحميل PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: Split Screen (Left: Preview, Right: Form or Full Preview) */}
        <div className="flex-1 flex overflow-hidden bg-slate-100">
          
          {/* Form Side */}
          <div className={`${activeTab === 'form' ? 'w-full' : 'w-full lg:w-1/2'} flex flex-col border-l border-slate-200 bg-white overflow-y-auto p-5 space-y-4`}>
            
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Building2 size={16} className="text-[#714B67]" /> المتغيرات المسقطة على العقد
                </span>
                {/* Font Switcher */}
                <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold px-1.5">الخط:</span>
                  <button
                    type="button"
                    onClick={() => handleFontChange('cairo')}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                      fontChoice === 'cairo'
                        ? 'bg-[#714B67] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="خط القاهرة المعتمد - واضح وعصري للمستندات الحكومية"
                  >
                    Cairo (القاهرة)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontChange('amiri')}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                      fontChoice === 'amiri'
                        ? 'bg-[#714B67] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="خط الأميري الكلاسيكي - خط النسخ المعتمد للجهات الرسمية"
                  >
                    Amiri (الأميري)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCoordsCalibrator(!showCoordsCalibrator)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <Sliders size={13} /> {showCoordsCalibrator ? 'إخفاء المعايرة' : 'معايرة الإحداثيات'}
                </button>
                <button
                  onClick={() => refreshPreview(fontChoice)}
                  disabled={isGenerating}
                  className="px-2.5 py-1 rounded-lg bg-[#714B67]/10 text-[#714B67] hover:bg-[#714B67]/20 font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} /> تحديث المعاينة
                </button>
              </div>
            </div>

            {/* Coordinates Calibrator Drawer */}
            {showCoordsCalibrator && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-[11px]">
                <div className="flex justify-between items-center font-bold text-amber-900">
                  <span className="flex items-center gap-1"><AlertCircle size={14} /> معايرة إحداثيات الطباعة بالنقاط (Points / X, Y)</span>
                  <button
                    onClick={() => {
                      setCoords(DEFAULT_PAM_COORDINATES);
                      toast.success('تمت استعادة الإحداثيات الافتراضية');
                    }}
                    className="text-amber-800 underline text-[10px] cursor-pointer"
                  >
                    استعادة الافتراضي
                  </button>
                </div>
                <p className="text-slate-600 text-[10px]">
                  تم ضبط كافة الإحداثيات بدقة بالغة على الفراغات والخطوط المنقطة للنموذج رقم (2). يمكنك تعديل أي إحداثي يدوياً إن دعت الحاجة:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 font-mono">
                  <div>
                    <label className="text-[10px] text-slate-500 block">إدارة العمل (Y)</label>
                    <input 
                      type="number" 
                      value={coords.laborDeptAr.y} 
                      onChange={e => setCoords(c => ({ ...c, laborDeptAr: { ...c.laborDeptAr, y: Number(e.target.value) } }))}
                      className="w-full p-1 border rounded bg-white text-[11px]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">اسم الشركة (Y)</label>
                    <input 
                      type="number" 
                      value={coords.companyNameAr.y} 
                      onChange={e => setCoords(c => ({ ...c, companyNameAr: { ...c.companyNameAr, y: Number(e.target.value) } }))}
                      className="w-full p-1 border rounded bg-white text-[11px]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">اسم الموظف (Y)</label>
                    <input 
                      type="number" 
                      value={coords.empNameAr.y} 
                      onChange={e => setCoords(c => ({ ...c, empNameAr: { ...c.empNameAr, y: Number(e.target.value) } }))}
                      className="w-full p-1 border rounded bg-white text-[11px]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">الراتب (Y)</label>
                    <input 
                      type="number" 
                      value={coords.art4SalaryAr.y} 
                      onChange={e => setCoords(c => ({ ...c, art4SalaryAr: { ...c.art4SalaryAr, y: Number(e.target.value) } }))}
                      className="w-full p-1 border rounded bg-white text-[11px]" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: General Info & Department */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#714B67] flex items-center gap-1 border-b pb-1">
                <Building2 size={14} /> 1. إدارة العمل وتاريخ العقد (Header)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-500 block mb-0.5">إدارة العمل (عربي)</label>
                  <input
                    type="text"
                    value={formData.companyLaborDept}
                    onChange={e => setFormData({ ...formData, companyLaborDept: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">اليوم (عربي)</label>
                  <input
                    type="text"
                    value={formData.contractDay}
                    onChange={e => setFormData({ ...formData, contractDay: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">تاريخ التحرير (YYYY/MM/DD)</label>
                  <input
                    type="text"
                    value={formData.contractDate}
                    onChange={e => setFormData({ ...formData, contractDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: First Party (Company) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#714B67] flex items-center gap-1 border-b pb-1">
                <Building2 size={14} /> 2. الطرف الأول (الشركة / المنشأة)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-500 block mb-0.5">اسم المنشأة / الشركة</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Company Name (English)</label>
                  <input
                    type="text"
                    value={formData.companyNameEn || ''}
                    onChange={e => setFormData({ ...formData, companyNameEn: e.target.value })}
                    dir="ltr"
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">المفوض بالتوقيع (الاسم)</label>
                  <input
                    type="text"
                    value={formData.companyRepName}
                    onChange={e => setFormData({ ...formData, companyRepName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">رقم مدني المفوض بالتوقيع</label>
                  <input
                    type="text"
                    value={formData.companyRepCivilId}
                    onChange={e => setFormData({ ...formData, companyRepCivilId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-500 block mb-0.5">مجال العمل / النشاط التجاري</label>
                  <input
                    type="text"
                    value={formData.companyField}
                    onChange={e => setFormData({ ...formData, companyField: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Second Party (Employee) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#714B67] flex items-center gap-1 border-b pb-1">
                <User size={14} /> 3. الطرف الثاني (العامل / الموظف)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-500 block mb-0.5">اسم الموظف (عربي)</label>
                  <input
                    type="text"
                    value={formData.employeeNameAr}
                    onChange={e => setFormData({ ...formData, employeeNameAr: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Employee Name (English)</label>
                  <input
                    type="text"
                    value={formData.employeeNameEn}
                    onChange={e => setFormData({ ...formData, employeeNameEn: e.target.value })}
                    dir="ltr"
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">الرقم المدني (12 رقم)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={formData.employeeCivilId}
                    onChange={e => setFormData({ ...formData, employeeCivilId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold font-mono focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">الجنسية</label>
                  <input
                    type="text"
                    value={formData.employeeNationality}
                    onChange={e => setFormData({ ...formData, employeeNationality: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-500 block mb-0.5">بيانات الإقامة والسكن (Residence)</label>
                  <input
                    type="text"
                    value={formData.employeeResidence}
                    onChange={e => setFormData({ ...formData, employeeResidence: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Work & Salary */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#714B67] flex items-center gap-1 border-b pb-1">
                <Briefcase size={14} /> 4. طبيعة العمل والراتب التعاقدي
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-500 block mb-0.5">المهنة / المسمى الفني (عربي)</label>
                  <input
                    type="text"
                    value={formData.jobTitleAr}
                    onChange={e => setFormData({ ...formData, jobTitleAr: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Profession (English)</label>
                  <input
                    type="text"
                    value={formData.jobTitleEn}
                    onChange={e => setFormData({ ...formData, jobTitleEn: e.target.value })}
                    dir="ltr"
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">الراتب الأساسي (د.ك)</label>
                  <input
                    type="text"
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold font-mono focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">دورية دفع الأجر</label>
                  <input
                    type="text"
                    value={formData.salaryPeriod}
                    onChange={e => setFormData({ ...formData, salaryPeriod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Duration, Dates & Leave */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#714B67] flex items-center gap-1 border-b pb-1">
                <Calendar size={14} /> 5. مدة العقد وتاريخ النفاذ والإجازة السنوية
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-500 block mb-0.5">تاريخ نفاذ العقد</label>
                  <input
                    type="text"
                    value={formData.effectiveDate}
                    onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">مدة العقد (سنوات)</label>
                  <input
                    type="text"
                    value={formData.durationYears}
                    onChange={e => setFormData({ ...formData, durationYears: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">الإجازة السنوية (أيام)</label>
                  <input
                    type="text"
                    value={formData.leaveDay}
                    onChange={e => setFormData({ ...formData, leaveDay: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Refresh button in Form tab */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refreshPreview(fontChoice)}
                className="w-full py-2.5 px-4 bg-[#714B67] hover:bg-[#593951] text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                تحديث وحفظ المعاينة الحية للعقد
              </button>
            </div>

          </div>

          {/* PDF Preview Side */}
          <div className={`${activeTab === 'preview' ? 'w-full lg:w-1/2' : 'hidden lg:flex lg:w-1/2'} h-full flex flex-col bg-slate-200 p-2 sm:p-4`}>
            <div className="bg-white rounded-2xl shadow-inner border border-slate-300 flex-1 flex flex-col overflow-hidden">
              
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-bold flex items-center gap-1 text-[#714B67]">
                  <FileText size={14} /> المعاينة التفاعلية المباشرة (Live PDF Overlay)
                </span>
                <span className="bg-purple-100 text-[#714B67] font-mono px-2 py-0.5 rounded font-bold">
                  2 Pages (A4)
                </span>
              </div>

              <div className="flex-1 relative bg-slate-800">
                {isGenerating && (
                  <div className="absolute inset-0 bg-slate-900/60 z-10 flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw size={28} className="animate-spin text-[#714B67]" />
                    <p className="font-bold text-xs">جاري دمج وإسقاط المتغيرات على النموذج الرسمي...</p>
                  </div>
                )}
                {previewUrl ? (
                  <iframe 
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`} 
                    className="w-full h-full border-none" 
                    title="PAM Contract Preview"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 text-xs">
                    <p>جاري تحميل النموذج...</p>
                  </div>
                )}
              </div>

              {/* Bottom bar with quick tips */}
              <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>المستند مطابق 100% للنموذج الإسترشادي الصادر عن الهيئة العامة للقوى العاملة.</span>
                <button
                  onClick={handleDownload}
                  className="text-[#714B67] font-bold hover:underline cursor-pointer"
                >
                  تحميل نسخة للطباعة
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OdooPamContractModal;
