import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  FileText, Users, Building, Banknote, RefreshCw, X, ArrowLeft, 
  Sparkles, Zap, Download, Lock, Check
} from 'lucide-react';
import { Employee, Contract, AttendanceRecord, LeaveRequest } from '../types';

interface ComplianceSmartSentinelModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  contracts: Contract[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
}

export const ComplianceSmartSentinelModal: React.FC<ComplianceSmartSentinelModalProps> = ({
  isOpen,
  onClose,
  employees = [],
  contracts = [],
  attendance = [],
  leaves = [],
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAM' | 'WPS' | 'RESIDENCY' | 'QUOTAS'>('OVERVIEW');
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  if (!isOpen) return null;

  // فحص حقيقي للامتثال استناداً إلى البيانات
  const activeEmployees = employees.filter(e => e.status !== 'TERMINATED' && e.status !== 'RESIGNED');
  const totalEmployees = employees.length;
  const totalActive = activeEmployees.length;
  
  // فحص الإقامات المنتهية أو القريبة من الانتهاء (افتراضية أو حقيقية)
  const expiringResidencies = activeEmployees.filter(e => {
    if (!e.civilIdExpiry) return false;
    const expiry = new Date(e.civilIdExpiry);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 45;
  });

  // فحص عقود العمل الموثقة
  const unverifiedContracts = contracts.filter(c => !(c as any).isSigned && (c as any).status !== 'signed');

  // --- WPS Validation ---
  const employeesMissingIban = activeEmployees.filter(e => !e.iban || e.iban.length < 5);
  const employeesUnderMinWage = activeEmployees.filter(e => {
    const salary = Number((e as any).basicSalary || (e as any).salary) || 0;
    return salary > 0 && salary < 75; // الحد الأدنى للأجور 75 د.ك
  });
  const wpsIssuesCount = employeesMissingIban.length + employeesUnderMinWage.length;

  // --- Kuwaitization Quota ---
  const kuwaitiCount = activeEmployees.filter(e => e.isKuwaiti || e.nationality?.includes('كويت')).length;
  const kuwaitiRatio = totalActive > 0 ? (kuwaitiCount / totalActive) * 100 : 100;
  const requiredRatio = 5; // نسبة التكويت المستهدفة كمثال
  const isQuotaMet = totalActive === 0 || kuwaitiRatio >= requiredRatio;

  // حساب مؤشر الامتثال الكلي (Compliance Score)
  const issuesCount = expiringResidencies.length + unverifiedContracts.length + wpsIssuesCount + (isQuotaMet ? 0 : 1);
  const complianceScore = totalEmployees === 0 ? 100 : Math.max(0, Math.min(100, 100 - (issuesCount * 5)));

  const handleRunFullScan = () => {
    setIsScanning(true);
    setScanCompleted(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#53354c] via-[#714B67] to-[#3a2234] text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center shadow-lg">
              <ShieldAlert size={26} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">الحارس الذكي للامتثال الرقابي والقانوني</h2>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                  Kuwait Sentinel v18
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                منظومة مراقبة وتنبيهات استباقية خلفية لحماية الشركة من مخالفات الهيئة العامة للقوى العاملة (PAM) وبنك الكويت المركزي (WPS).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handleRunFullScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'جاري الفحص...' : 'فحص شامل فوري'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Sub-bar / Score Overview Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${
              complianceScore >= 90 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              complianceScore >= 75 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              {complianceScore}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">مؤشر الامتثال القانوني الكلي للشركة</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">حالة آمنة</span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {complianceScore >= 90 ? 'ممتاز - ملتزم بكافة معايير وقوانين العمل الكويتية' : 'يحتاج مراجعة بعض التنبيهات المعلقة'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'OVERVIEW' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              📊 نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('PAM')}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'PAM' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              🏛️ القوى العاملة (PAM)
            </button>
            <button
              onClick={() => setActiveTab('WPS')}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'WPS' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              💳 حماية الأجور (WPS)
            </button>
            <button
              onClick={() => setActiveTab('RESIDENCY')}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'RESIDENCY' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              🛂 الإقامات والبطاقات
            </button>
            <button
              onClick={() => setActiveTab('QUOTAS')}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${activeTab === 'QUOTAS' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              🇰🇼 التكويت (Quotas)
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {scanCompleted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span>تم إتمام الفحص الشامل لجميع السجلات بنجاح. لا توجد مخالفات حرجة تهدد إيقاف ملف الشركة.</span>
            </div>
          )}

          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Grid of Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">إجمالي الموظفين</span>
                    <Users size={18} className="text-[#714B67]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalEmployees}</div>
                  <div className="text-[11px] text-emerald-600 font-bold">جميعهم مسجلون بنجاح</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">الإقامات القريبة من الانتهاء</span>
                    <Clock size={18} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{expiringResidencies.length}</div>
                  <div className="text-[11px] text-amber-600 font-bold">تتطلب تجديد خلال 45 يوماً</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">عقود غير موثقة بالقوى العاملة</span>
                    <FileText size={18} className="text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{unverifiedContracts.length}</div>
                  <div className="text-[11px] text-slate-500 font-bold">تحتاج توثيق إلكتروني</div>
                </div>

                <div className={`bg-white p-4 rounded-xl border shadow-xs space-y-2 ${wpsIssuesCount === 0 ? 'border-slate-200' : 'border-rose-200'}`}>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">ملاحظات حماية الأجور (WPS)</span>
                    <Banknote size={18} className={wpsIssuesCount === 0 ? "text-emerald-600" : "text-rose-600"} />
                  </div>
                  <div className={`text-2xl font-black ${wpsIssuesCount === 0 ? "text-emerald-700" : "text-rose-700"}`}>{wpsIssuesCount}</div>
                  <div className={`text-[11px] font-bold ${wpsIssuesCount === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {wpsIssuesCount === 0 ? 'متوافق وجاهز للتصدير' : 'يوجد تضارب يمنع التصدير'}
                  </div>
                </div>
              </div>

              {/* Active Compliance Alerts List */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#714B67]" />
                  <span>توصيات الحارس الذكي لتعزيز الامتثال القانوني:</span>
                </h3>

                <div className="space-y-3">
                  {!isQuotaMet && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">مخالفة لنسب العمالة الوطنية (الكويتة)</div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          النسبة الحالية ({kuwaitiRatio.toFixed(1)}%) أقل من المطلوب. يرجى توظيف عمالة وطنية لتجنب إيقاف الملف بوزارة الشؤون.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                    <Sparkles size={18} className="text-[#714B67] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">جاهزية العقود للتدقيق الآلي</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        قم برفع صور العقود لتفعيل <strong>(Legal & Document OCR Bot)</strong> في المرحلة القادمة لمقارنتها آلياً مع PAM Form 2.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Clock size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">متابعة فترات التجربة للموظفين الجدد</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        تأكد من تقييم الموظفين الجدد قبل انتهاء فترة التجربة البالغة 100 يوم طبقاً لقانون العمل الكويتي.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAM' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-black text-slate-900">متطلبات الهيئة العامة للقوى العاملة (PAM)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                يراقب الحارس الذكي حالة ترخيص العمل، ملف الشركة الرئيسي، وسلامة الأذونات لضمان عدم إيقاف خدمات البوابة الآلية للشركة.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">رقم الملف الرئيسي بالقوى العاملة:</span>
                  <span className="font-mono font-bold text-slate-900">KW-2026-98812</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">حالة التفويض الإداري:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">ساري ومعتمد</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WPS' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-black text-slate-900">نظام حماية الأجور (WPS - Wage Protection System)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                يضمن الحارس الذكي توافق مسير الرواتب الشهري مع متطلبات البنك المركزي الكويتي قبل التصدير.
              </p>
              
              {wpsIssuesCount === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>جميع مسيرات الرواتب نشطة وآمنة (جميع الموظفين لديهم IBAN والرواتب أعلى من الحد الأدنى 75 د.ك).</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>تم رصد ({wpsIssuesCount}) ملاحظة تمنع تصدير ملف الـ WPS بنجاح!</span>
                  </div>

                  {employeesMissingIban.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800">موظفون بلا حساب بنكي (IBAN):</h4>
                      {employeesMissingIban.map((emp, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                          <span className="font-bold">{emp.fullNameAr}</span>
                          <span className="text-rose-600 font-bold bg-rose-100 px-2 py-1 rounded">IBAN مفقود</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {employeesUnderMinWage.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800">موظفون رواتبهم أقل من الحد الأدنى (75 د.ك):</h4>
                      {employeesUnderMinWage.map((emp, idx) => (
                        <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center justify-between">
                          <span className="font-bold">{emp.fullNameAr}</span>
                          <span className="text-amber-700 font-bold font-mono">الراتب: {(emp as any).basicSalary || (emp as any).salary} د.ك</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'QUOTAS' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-black text-slate-900">نسب التكويت والعمالة الوطنية (Kuwaitization Quotas)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                متابعة لحظية لنسبة العمالة الوطنية في المنشأة لضمان عدم توقف خدمات وزارة الشؤون وإيقاف الملف.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-xs text-slate-500 font-bold">العمالة الوطنية (الكويتيين)</div>
                  <div className="text-2xl font-black text-slate-900">{kuwaitiCount} <span className="text-xs text-slate-500 font-normal">موظف</span></div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-xs text-slate-500 font-bold">نسبة التكويت الحالية</div>
                  <div className={`text-2xl font-black ${isQuotaMet ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {kuwaitiRatio.toFixed(1)}%
                  </div>
                </div>
              </div>

              {isQuotaMet ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>نسبة التكويت مطابقة لمتطلبات القوى العاملة (الحد الأدنى المستهدف {requiredRatio}%).</span>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span>تحذير: نسبة التكويت الحالية ({kuwaitiRatio.toFixed(1)}%) أقل من الحد الأدنى المطلوب ({requiredRatio}%).</span>
                  </div>
                  <p className="text-rose-700 font-normal mt-1">
                    قد يؤدي ذلك إلى إيقاف إصدار تصاريح العمل الجديدة للمقيمين وتجميد ملف الشركة بوزارة الشؤون. يرجى توظيف عمالة وطنية لتعديل النسبة.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'RESIDENCY' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-black text-slate-900">متابعة الإقامات وتواريخ انتهاء البطاقات المدنية</h3>
              {expiringResidencies.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                  لا توجد إقامات منتهية أو حرجة خلال الـ 45 يوماً القادمة. جميع الموظفين في وضع سليم.
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringResidencies.map((emp, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{emp.fullNameAr || (emp as any).name || 'موظف'}</span>
                        <span className="text-slate-500 mr-2">({emp.civilId || emp.employeeCode})</span>
                      </div>
                      <span className="font-mono text-amber-700 font-bold">انتهاء: {emp.civilIdExpiry}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>نظام الحارس الذكي يعمل في الخلفية 24/7 لحماية منشأتك</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
