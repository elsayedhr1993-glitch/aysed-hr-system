import React, { useState, useEffect } from 'react';
import { 
  ContractData, 
  calculateTotalContractWage, 
  printKuwaitContractReport 
} from '../services/contractService';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: ContractData) => void;
  employeeList: Array<{ id: string; nameAr: string; nameEn: string; civilId: string; dept: string; jobTitle: string }>;
}

export default function OdooContractFormModal({ isOpen, onClose, onSave, employeeList }: ContractModalProps) {
  const [activeTab, setActiveTab] = useState<'salary' | 'schedule' | 'terms'>('salary');

  // مسار حالة العقد (Odoo Status Pipeline)
  const [contractState, setContractState] = useState<'draft' | 'running' | 'expired' | 'cancelled'>('draft');

  // البيانات العامة
  const [contractRef, setContractRef] = useState(`CONT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedEmpId, setSelectedEmpId] = useState(employeeList[0]?.id || '');
  const [contractType, setContractType] = useState<'محدد المدة (Fixed Term)' | 'غير محدد المدة (Indefinite)'>('محدد المدة (Fixed Term)');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [trialDays, setTrialDays] = useState(100);

  // هيكل الرواتب والبدلات
  const [basicWage, setBasicWage] = useState<number>(1200);
  const [housing, setHousing] = useState<number>(200);
  const [transport, setTransport] = useState<number>(100);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(150);
  const [otherAllowance, setOtherAllowance] = useState<number>(0);
  const [totalWage, setTotalWage] = useState<number>(0);

  // جدول وساعات العمل
  const [weeklyHours, setWeeklyHours] = useState(48);
  const [annualLeaves, setAnnualLeaves] = useState(30);
  const [noticePeriod, setNoticePeriod] = useState(90);
  const [ticketAllowance, setTicketAllowance] = useState(true);
  const [termsNotes, setTermsNotes] = useState('يخضع هذا العقد لقانون العمل الكويتي رقم 6 لسنة 2010 واللوائح الطبية الصادرة عن وزارة الصحة.');

  // تحديث إجمالي الراتب تلقائياً عند تغيير أي بدل
  useEffect(() => {
    const total = calculateTotalContractWage(basicWage, housing, transport, medicalAllowance, otherAllowance);
    setTotalWage(total);
  }, [basicWage, housing, transport, medicalAllowance, otherAllowance]);

  if (!isOpen) return null;

  const currentEmp = employeeList.find(e => e.id === selectedEmpId) || employeeList[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ContractData = {
      id: `CTR-${Date.now()}`,
      contractReference: contractRef,
      employeeId: currentEmp?.id || 'EMP-001',
      employeeNameAr: currentEmp?.nameAr || '',
      employeeNameEn: currentEmp?.nameEn || '',
      civilId: currentEmp?.civilId || '',
      jobTitleAr: currentEmp?.jobTitle || '',
      jobTitleEn: '',
      departmentAr: currentEmp?.dept || '',
      departmentEn: '',
      contractType,
      startDate,
      endDate: contractType === 'محدد المدة (Fixed Term)' ? endDate : undefined,
      trialPeriodDays: trialDays,
      wageBasic: basicWage,
      housingAllowance: housing,
      transportAllowance: transport,
      medicalNatureAllowance: medicalAllowance,
      otherAllowances: otherAllowance,
      totalWage,
      workingHoursWeekly: weeklyHours,
      annualLeaveDays: annualLeaves,
      noticePeriodDays: noticePeriod,
      airTicketAllowance: ticketAllowance,
      termsAndConditionsAr: termsNotes,
      state: contractState
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        
        {/* 1. الترويسة ومسار الحالات (Odoo Form Header & Status Bar) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-bold text-sm">العقود (Contracts) /</span>
            <span className="text-slate-700 font-bold text-sm">{contractRef}</span>
          </div>

          {/* شريط الحالات النقطي الخاص بأودو */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-lg gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setContractState('draft')}
              className={`px-3 py-1 rounded-md transition ${contractState === 'draft' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'}`}
            >
              مسودة (Draft)
            </button>
            <button
              type="button"
              onClick={() => setContractState('running')}
              className={`px-3 py-1 rounded-md transition ${contractState === 'running' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'}`}
            >
              ساري (Running)
            </button>
            <button
              type="button"
              onClick={() => setContractState('expired')}
              className={`px-3 py-1 rounded-md transition ${contractState === 'expired' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              منتهي (Expired)
            </button>
            <button
              type="button"
              onClick={() => setContractState('cancelled')}
              className={`px-3 py-1 rounded-md transition ${contractState === 'cancelled' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              ملغي (Cancelled)
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
          
          {/* 2. تفاصيل العقد العامة (Top Sheet Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الموظف المعني (Employee) <span className="text-rose-500">*</span></label>
              <select 
                value={selectedEmpId} 
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-bold text-slate-800"
              >
                {employeeList.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameAr} — ({emp.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">نوع العقد (Contract Type)</label>
              <select 
                value={contractType} 
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
              >
                <option value="محدد المدة (Fixed Term)">محدد المدة (Fixed Term)</option>
                <option value="غير محدد المدة (Indefinite)">غير محدد المدة (Indefinite)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">مرجع العقد (Reference Code)</label>
              <input 
                type="text" 
                value={contractRef} 
                onChange={(e) => setContractRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-purple-900"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">تاريخ بداية العقد (Start Date) <span className="text-rose-500">*</span></label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                required
              />
            </div>

            {contractType === 'محدد المدة (Fixed Term)' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ نهاية العقد (End Date)</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">فترة التجربة (Trial Period)</label>
              <select 
                value={trialDays} 
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
              >
                <option value={100}>100 يوم (الحد الأقصى قانوناً)</option>
                <option value={60}>60 يوماً</option>
                <option value={0}>بدون فترة تجربة</option>
              </select>
            </div>
          </div>

          {/* 3. تبويبات Odoo Notebook الداخلية */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('salary')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'salary' 
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              هيكل الراتب والبدلات (Salary Information)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'schedule' 
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              مواعيد العمل والإجازات (Working Schedule)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'terms' 
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              الشروط والأحكام (Terms & Conditions)
            </button>
          </div>

          {/* 4. محتوى التبويبات */}
          
          {/* 4.1 تبويب تفاصيل الراتب */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الراتب الأساسي (Wage / Basic) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    value={basicWage} 
                    onChange={(e) => setBasicWage(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">بدل السكن (Housing)</label>
                  <input 
                    type="number" 
                    value={housing} 
                    onChange={(e) => setHousing(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">بدل الانتقال (Transport)</label>
                  <input 
                    type="number" 
                    value={transport} 
                    onChange={(e) => setTransport(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">بدل طبيعة عمل / كادر طبي</label>
                  <input 
                    type="number" 
                    value={medicalAllowance} 
                    onChange={(e) => setMedicalAllowance(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">بدلات أخرى ثابتة</label>
                  <input 
                    type="number" 
                    value={otherAllowance} 
                    onChange={(e) => setOtherAllowance(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* شريط الإجمالي المحسوب آلياً */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 text-xs">إجمالي الأجر الشهري التعاقدي (Gross Wage):</span>
                  <p className="text-[11px] text-purple-700">هذا المبلغ هو المعتمد في مسيرات WPS ونهاية الخدمة</p>
                </div>
                <div className="text-base font-black font-mono text-purple-950">
                  {totalWage.toFixed(3)} د.ك
                </div>
              </div>
            </div>
          )}

          {/* 4.2 تبويب مواعيد العمل والإجازات */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ساعات العمل الأسبوعية (Working Hours)</label>
                <input 
                  type="number" 
                  value={weeklyHours} 
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رصيد الإجازة السنوية القانوني (أيام)</label>
                <input 
                  type="number" 
                  value={annualLeaves} 
                  onChange={(e) => setAnnualLeaves(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">مهلة الإخطار بإنهاء العقد (Notice Period)</label>
                <select 
                  value={noticePeriod} 
                  onChange={(e) => setNoticePeriod(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                >
                  <option value={90}>3 أشهر (90 يوماً - المعياري)</option>
                  <option value={30}>شهر واحد (30 يوماً)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  id="ticket" 
                  checked={ticketAllowance} 
                  onChange={(e) => setTicketAllowance(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="ticket" className="font-bold text-slate-700 cursor-pointer">
                  استحقاق تذكرة سفر سنوية (Annual Air Ticket)
                </label>
              </div>
            </div>
          )}

          {/* 4.3 تبويب الشروط والأحكام */}
          {activeTab === 'terms' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">البنود والاشتراطات الخاصة الملحقة بالعقد</label>
              <textarea 
                rows={4}
                value={termsNotes}
                onChange={(e) => setTermsNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          )}

          {/* 5. شريط الإجراءات السفلي (Odoo Form Actions) */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => {
                if (currentEmp) {
                  printKuwaitContractReport({
                    id: 'PREVIEW',
                    contractReference: contractRef,
                    employeeId: currentEmp.id,
                    employeeNameAr: currentEmp.nameAr,
                    employeeNameEn: currentEmp.nameEn,
                    civilId: currentEmp.civilId,
                    jobTitleAr: currentEmp.jobTitle,
                    jobTitleEn: '',
                    departmentAr: currentEmp.dept,
                    departmentEn: '',
                    contractType,
                    startDate,
                    trialPeriodDays: trialDays,
                    wageBasic: basicWage,
                    housingAllowance: housing,
                    transportAllowance: transport,
                    medicalNatureAllowance: medicalAllowance,
                    otherAllowances: otherAllowance,
                    totalWage,
                    workingHoursWeekly: weeklyHours,
                    annualLeaveDays: annualLeaves,
                    noticePeriodDays: noticePeriod,
                    airTicketAllowance: ticketAllowance,
                    termsAndConditionsAr: termsNotes,
                    state: contractState
                  });
                }
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition flex items-center gap-1.5"
            >
              <span>🖨️</span> معاينة وطباعة العقد الرسمي
            </button>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition"
              >
                إلغاء (Discard)
              </button>
              <button 
                type="submit"
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-lg font-bold transition shadow-sm"
              >
                حفظ واعتماد العقد (Save)
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
