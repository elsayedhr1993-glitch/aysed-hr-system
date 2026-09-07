import React, { useState, useMemo } from 'react';
import { 
  Calculator, X, Scale, Clock, Calendar, CheckCircle2, 
  HelpCircle, FileText, ArrowLeft, RefreshCw 
} from 'lucide-react';

interface KuwaitHrQuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KuwaitHrQuickCalculatorModal: React.FC<KuwaitHrQuickCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'eos' | 'wage' | 'leave'>('eos');

  // EOS Calculator state
  const [eosSalary, setEosSalary] = useState<number>(850);
  const [eosYears, setEosYears] = useState<number>(4);
  const [eosMonths, setEosMonths] = useState<number>(6);
  const [eosTerminationType, setEosTerminationType] = useState<'EMPLOYER_TERMINATION' | 'RESIGNATION'>('EMPLOYER_TERMINATION');

  // Daily & Hourly Wage state
  const [wageSalary, setWageSalary] = useState<number>(750);
  const [wageDivisor, setWageDivisor] = useState<number>(26); // مادة 56
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(8);

  // Leave Liquidation state
  const [leaveSalary, setLeaveSalary] = useState<number>(800);
  const [leaveDaysBalance, setLeaveDaysBalance] = useState<number>(24);
  const [leaveDivisor, setLeaveDivisor] = useState<number>(26);

  // EOS calculation based on Kuwait Labor Law Article 51 & 53
  const eosResult = useMemo(() => {
    const totalYears = Number(eosYears || 0) + Number(eosMonths || 0) / 12;
    if (totalYears <= 0 || eosSalary <= 0) {
      return { totalAmount: 0, firstFiveYearsAmount: 0, nextYearsAmount: 0, resignationFactor: 1, capExceeded: false, legalNote: '' };
    }

    // الأجر اليومي لاحتساب نهاية الخدمة = الراتب الشامل / 26
    const dailyWage = eosSalary / 26;

    // السنوات الخمس الأولى: 15 يوماً عن كل سنة
    const firstFivePeriod = Math.min(5, totalYears);
    const firstFiveYearsAmount = firstFivePeriod * (dailyWage * 15);

    // ما زاد عن 5 سنوات: شهر (26 يوماً أو راتب كامل) عن كل سنة
    const nextPeriod = Math.max(0, totalYears - 5);
    const nextYearsAmount = nextPeriod * eosSalary;

    let fullEos = firstFiveYearsAmount + nextYearsAmount;

    // الحد الأقصى القانوني: ألا تزيد المكافأة عن أجر سنة ونصف (18 شهراً)
    const maxCap = eosSalary * 18;
    const capExceeded = fullEos > maxCap;
    if (capExceeded) {
      fullEos = maxCap;
    }

    // معامل الاستقالة (مادة 53 من قانون العمل الكويتي)
    let resignationFactor = 1;
    let legalNote = 'تستحق المكافأة كاملة لانتهاء العقد من طرف المنشأة أو انتهاء مدته';

    if (eosTerminationType === 'RESIGNATION') {
      if (totalYears < 3) {
        resignationFactor = 0;
        legalNote = 'أقل من 3 سنوات خدمة: لا يستحق العامل مكافأة نهاية خدمة في حال الاستقالة (مادة 53)';
      } else if (totalYears < 5) {
        resignationFactor = 0.5;
        legalNote = 'من 3 إلى أقل من 5 سنوات: يستحق نصف المكافأة (50%) في حال الاستقالة (مادة 53)';
      } else if (totalYears < 10) {
        resignationFactor = 2 / 3;
        legalNote = 'من 5 إلى أقل من 10 سنوات: يستحق ثلثي المكافأة (66.67%) في حال الاستقالة (مادة 53)';
      } else {
        resignationFactor = 1;
        legalNote = '10 سنوات خدمة فأكثر: يستحق المكافأة كاملة (100%) حتى في حال الاستقالة (مادة 53)';
      }
    }

    const totalAmount = fullEos * resignationFactor;

    return {
      totalAmount: Number(totalAmount.toFixed(3)),
      firstFiveYearsAmount: Number(firstFiveYearsAmount.toFixed(3)),
      nextYearsAmount: Number(nextYearsAmount.toFixed(3)),
      fullEosBeforeResignation: Number(fullEos.toFixed(3)),
      resignationFactor,
      capExceeded,
      legalNote
    };
  }, [eosSalary, eosYears, eosMonths, eosTerminationType]);

  // Daily & Hourly calculation
  const wageResult = useMemo(() => {
    const divisor = wageDivisor > 0 ? wageDivisor : 26;
    const daily = wageSalary / divisor;
    const hourly = daily / (workHoursPerDay > 0 ? workHoursPerDay : 8);
    const overtimeDay = hourly * 1.25; // 125%
    const overtimeNightHoliday = hourly * 1.5; // 150%

    return {
      daily: Number(daily.toFixed(3)),
      hourly: Number(hourly.toFixed(3)),
      overtimeDay: Number(overtimeDay.toFixed(3)),
      overtimeNightHoliday: Number(overtimeNightHoliday.toFixed(3))
    };
  }, [wageSalary, wageDivisor, workHoursPerDay]);

  // Leave liquidation calculation
  const leaveResult = useMemo(() => {
    const divisor = leaveDivisor > 0 ? leaveDivisor : 26;
    const dailyWage = leaveSalary / divisor;
    const totalAmount = dailyWage * Number(leaveDaysBalance || 0);

    return {
      dailyWage: Number(dailyWage.toFixed(3)),
      totalAmount: Number(totalAmount.toFixed(3))
    };
  }, [leaveSalary, leaveDaysBalance, leaveDivisor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 dir-rtl" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#714B67] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">حاسبة قانون العمل الكويتي السريعة (رقم 6 لسنة 2010)</h3>
              <p className="text-[11px] text-white/80">احتساب فوري لمكافأة نهاية الخدمة، الأجور، وتصفيات الإجازات</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white/90 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('eos')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'eos'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Scale size={15} className="text-[#714B67]" />
            <span>نهاية الخدمة (مادة 51 و 53)</span>
          </button>

          <button
            onClick={() => setActiveTab('wage')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'wage'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Clock size={15} className="text-[#714B67]" />
            <span>الأجر اليومي والإضافي (مادة 56)</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'leave'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Calendar size={15} className="text-[#714B67]" />
            <span>بدل وتصفية الإجازة (مادة 70)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* TAB 1: EOS */}
          {activeTab === 'eos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل الأخير (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={eosSalary}
                    onChange={(e) => setEosSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">يشمل الراتب الأساسي + جميع البدلات الثابتة</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سبب إنهاء العلاقة العمالية *</label>
                  <select
                    value={eosTerminationType}
                    onChange={(e) => setEosTerminationType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  >
                    <option value="EMPLOYER_TERMINATION">إنهاء خدمة من صاحب العمل / انتهاء محدد المدة (كاملة)</option>
                    <option value="RESIGNATION">استقالة العامل من طرفه (تخضع لجدول المادة 53)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">تحدد نسبة الاستحقاق القانونية</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سنوات الخدمة المكتملة</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={eosYears}
                    onChange={(e) => setEosYears(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأشهر الإضافية</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={eosMonths}
                    onChange={(e) => setEosMonths(Math.max(0, Math.min(11, Number(e.target.value))))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="bg-gradient-to-br from-purple-50 via-slate-50 to-emerald-50 rounded-2xl p-4 border border-purple-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">صافي مكافأة نهاية الخدمة المستحقة:</span>
                  <div className="text-xl font-black text-[#714B67] font-mono">
                    {eosResult.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-xs font-bold text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">السنوات الـ 5 الأولى:</span>
                    <strong className="font-mono text-slate-800">{eosResult.firstFiveYearsAmount.toFixed(3)} د.ك</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">ما زاد عن 5 سنوات:</span>
                    <strong className="font-mono text-slate-800">{eosResult.nextYearsAmount.toFixed(3)} د.ك</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">نسبة الاستحقاق:</span>
                    <strong className="font-mono text-emerald-700">{(eosResult.resignationFactor * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {eosResult.capExceeded && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
                    ⚠️ تم تطبيق الحد الأقصى للمكافأة (18 شهراً = {(eosSalary * 18).toFixed(3)} د.ك) طبقاً للمادة 51.
                  </div>
                )}

                <div className="text-[11px] text-slate-600 bg-white/60 p-2.5 rounded-xl border border-slate-200 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>{eosResult.legalNote}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WAGE & OVERTIME */}
          {activeTab === 'wage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشهري (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={wageSalary}
                    onChange={(e) => setWageSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مقسم الشهر (أيام العمل) *</label>
                  <input
                    type="number"
                    min="20"
                    max="31"
                    value={wageDivisor}
                    onChange={(e) => setWageDivisor(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">26 يوماً حسب المادة 56 من القانون</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعات العمل اليومية</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={workHoursPerDay}
                    onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">الحد الأقصى القانوني: 8 ساعات (48 أسبوعياً)</span>
                </div>
              </div>

              {/* Wage Result Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الأجر اليومي (Daily Wage):</span>
                  <div className="text-base font-black text-slate-900 font-mono mt-1">
                    {wageResult.daily.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">أجر الساعة الأساسي (Hourly):</span>
                  <div className="text-base font-black text-blue-700 font-mono mt-1">
                    {wageResult.hourly.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الإضافي النهاري (125%):</span>
                  <div className="text-base font-black text-emerald-700 font-mono mt-1">
                    {wageResult.overtimeDay.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الإضافي الليلي/العطلات (150%):</span>
                  <div className="text-base font-black text-purple-700 font-mono mt-1">
                    {wageResult.overtimeNightHoliday.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed font-medium">
                💡 <strong>سند قانوني:</strong> تحسب معدلات الأجر لجميع العمال الذين يتقاضون أجورهم بالشهر بقسمة الراتب على 26 يوماً (المادة 56). ويستحق العامل عن ساعات العمل الإضافية أجراً يعادل أجره العادي في تلك الفترة مضافاً إليه 25% نهاراً أو 50% ليلاً وفي أيام الراحة الأسبوعية (المادة 66).
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE LIQUIDATION */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل للموظف (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={leaveSalary}
                    onChange={(e) => setLeaveSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رصيد الإجازات المتبقي (أيام) *</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={leaveDaysBalance}
                    onChange={(e) => setLeaveDaysBalance(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مقسم الراتب (أيام)</label>
                  <input
                    type="number"
                    min="20"
                    max="31"
                    value={leaveDivisor}
                    onChange={(e) => setLeaveDivisor(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">26 يوماً (المعتمد في الكويت)</span>
                </div>
              </div>

              {/* Leave Result Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-600 block text-xs font-bold">القيمة النقدية لبدل رصيد الإجازات المستحق:</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    (أجر اليوم: {leaveResult.dailyWage.toFixed(3)} د.ك × {leaveDaysBalance} يوم)
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  {leaveResult.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-xs font-bold text-slate-500">د.ك</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-medium">
                💡 <strong>المادة 70 و 71:</strong> يستحق العامل إجازة سنوية مدفوعة الأجر مدتها 30 يوماً عمل عن كل سنة. ويجوز تصفية الإجازة أو صرف بدلها النقدي عند انتهاء العقد على أساس آخر أجر تقاضاه العامل شاملاً جميع البدلات.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};

export default KuwaitHrQuickCalculatorModal;
