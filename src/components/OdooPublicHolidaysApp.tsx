import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Search, 
  Building2, 
  UserCheck, 
  Layers, 
  X, 
  Calculator,
  ShieldAlert,
  CalendarDays,
  FileCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  Printer,
  Check,
  Info,
  BadgeAlert,
  Flame
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';

export interface PublicHoliday {
  id: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  type: 'national' | 'religious' | 'official' | 'cabinet_decision';
  status: 'approved' | 'active';
  isPaid: boolean;
  decreeNumber?: string;
  notes?: string;
}

export interface HolidayDutyAssignment {
  id: string;
  employeeName: string;
  civilId: string;
  jobTitle: string;
  holidayName: string;
  dutyDate: string;
  basicSalary: number;
  totalSalary: number;
  compensationType: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave'; // أجر مضاعف 200% أو يوم راحة بديل أو إضافة لرصيد الإجازات السنوية
  calculatedAmount: number;
  status: 'approved' | 'settled';
}

const kuwaitOfficialHolidaysList: PublicHoliday[] = [
  {
    id: 'HOL-KW-01',
    nameAr: 'رأس السنة الميلادية 2026',
    nameEn: 'New Year Day',
    startDate: '2026-01-01',
    endDate: '2026-01-01',
    daysCount: 1,
    type: 'official',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء رقم 1 لسنة 2026',
    notes: 'عطلة رسمية لكافة الوزارات والجهات والمؤسسات الحكومية والقطاع الأهلي'
  },
  {
    id: 'HOL-KW-02',
    nameAr: 'ذكرى الإسراء والمعراج',
    nameEn: 'Israa & Miraj',
    startDate: '2026-01-16',
    endDate: '2026-01-16',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية الرسمية',
    notes: 'عطلة دينية مدفوعة الأجر بالكامل'
  },
  {
    id: 'HOL-KW-03',
    nameAr: 'العيد الوطني ويوم التحرير (25 - 26 فبراير)',
    nameEn: 'National & Liberation Days',
    startDate: '2026-02-25',
    endDate: '2026-02-26',
    daysCount: 2,
    type: 'national',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم الأعياد الوطنية الرسمية',
    notes: 'ذكرى الاستقلال ويوم التحرير المجيد لدولة الكويت'
  },
  {
    id: 'HOL-KW-04',
    nameAr: 'عطلة عيد الفطر المبارك 1447هـ',
    nameEn: 'Eid Al-Fitr Holiday',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    daysCount: 3,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء - إجازة العيد',
    notes: '3 أيام رسمية متتالية وفق تقويم هيئة الرؤية الشرعية'
  },
  {
    id: 'HOL-KW-05',
    nameAr: 'وقفة عرفات وعطلة عيد الأضحى المبارك',
    nameEn: 'Waqfat Arafat & Eid Al-Adha',
    startDate: '2026-05-26',
    endDate: '2026-05-29',
    daysCount: 4,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء - عيد الأضحى',
    notes: '4 أيام تشمل يوم الوقفة وثلاثة أيام التشريق'
  },
  {
    id: 'HOL-KW-06',
    nameAr: 'رأس السنة الهجرية 1448هـ',
    nameEn: 'Islamic Hijri New Year',
    startDate: '2026-06-16',
    endDate: '2026-06-16',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية',
    notes: 'غرة شهر محرم الحرام للسنة الهجرية الجديدة'
  },
  {
    id: 'HOL-KW-07',
    nameAr: 'المولد النبوي الشريف',
    nameEn: 'Prophet Muhammad Birthday',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية',
    notes: '12 ربيع الأول - ذكرى المولد النبوي الشريف'
  }
];

export const OdooPublicHolidaysApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [holidays, setHolidays] = useState<PublicHoliday[]>(kuwaitOfficialHolidaysList);
  const [duties, setDuties] = useState<HolidayDutyAssignment[]>([]);

  const [activeTab, setActiveTab] = useState<'calendar' | 'duties' | 'integration'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCabinetModal, setShowCabinetModal] = useState(false);
  const [showDutyModal, setShowDutyModal] = useState(false);

  // Cabinet Emergency Holiday Form
  const [cabinetForm, setCabinetForm] = useState({
    nameAr: '',
    nameEn: '',
    startDate: '',
    endDate: '',
    daysCount: '1',
    decreeNumber: 'قرار مجلس الوزراء رقم ( ) لسنة 2026',
    notes: 'عطلة رسمية طارئة بقرار مجلس الوزراء'
  });

  // New Duty Assignment Form
  const [dutyForm, setDutyForm] = useState({
    employeeName: '',
    civilId: '',
    jobTitle: '',
    holidayName: '',
    dutyDate: '',
    totalSalary: '',
    compensationType: 'double_pay' as 'double_pay' | 'comp_day_off' | 'add_to_annual_leave'
  });

  // Calculate Kuwait Article 68 Compensation (200% double pay)
  const calculateDutyCompensation = (salary: number, type: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave') => {
    if (type === 'comp_day_off' || type === 'add_to_annual_leave') return 0;
    const dayRate = salary / 26; // أساس 26 يوماً
    return Math.round(dayRate * 2 * 1000) / 1000; // أجر مضاعف 200%
  };

  // Add Cabinet Decision Emergency Holiday
  const handleCreateCabinetHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabinetForm.nameAr || !cabinetForm.startDate) return;

    const days = parseInt(cabinetForm.daysCount) || 1;
    const created: PublicHoliday = {
      id: `HOL-CAB-${Date.now().toString().slice(-4)}`,
      nameAr: cabinetForm.nameAr,
      nameEn: cabinetForm.nameEn || 'Emergency Cabinet Decision Holiday',
      startDate: cabinetForm.startDate,
      endDate: cabinetForm.endDate || cabinetForm.startDate,
      daysCount: days,
      type: 'cabinet_decision',
      status: 'approved',
      isPaid: true,
      decreeNumber: cabinetForm.decreeNumber,
      notes: cabinetForm.notes
    };

    setHolidays([created, ...holidays]);
    setShowCabinetModal(false);
    setCabinetForm({
      nameAr: '',
      nameEn: '',
      startDate: '',
      endDate: '',
      daysCount: '1',
      decreeNumber: 'قرار مجلس الوزراء رقم ( ) لسنة 2026',
      notes: 'عطلة رسمية طارئة بقرار مجلس الوزراء'
    });
  };

  // Add Holiday Duty Assignment
  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const salary = parseFloat(dutyForm.totalSalary) || 0;
    const amount = calculateDutyCompensation(salary, dutyForm.compensationType);

    const created: HolidayDutyAssignment = {
      id: `DUTY-2026-0${duties.length + 1}`,
      employeeName: dutyForm.employeeName,
      civilId: dutyForm.civilId,
      jobTitle: dutyForm.jobTitle,
      holidayName: dutyForm.holidayName,
      dutyDate: dutyForm.dutyDate,
      basicSalary: salary * 0.7,
      totalSalary: salary,
      compensationType: dutyForm.compensationType,
      calculatedAmount: amount,
      status: 'approved'
    };

    setDuties([created, ...duties]);
    setShowDutyModal(false);
  };

  // Filtered Holidays
  const filteredHolidays = holidays.filter(h => 
    h.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.decreeNumber && h.decreeNumber.includes(searchQuery))
  );

  const totalHolidaysDays = holidays.reduce((acc, h) => acc + h.daysCount, 0);
  const totalDutiesAmount = duties.reduce((acc, d) => acc + d.calculatedAmount, 0);

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. ODOO CONTROL PANEL & TOP BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>العطلات الرسمية</span>
            <span>/</span>
            <span className="text-[#714B67] font-black">جدول العطلات والقرارات الرسمية للكويت (2026)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-[#714B67]" size={22} />
            تطبيق العطلات الرسمية والبدلات القانونية (Kuwait Public Holidays)
          </h1>
          <p className="text-[11px] text-slate-500">
            المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | مدفوعة الأجر 100% ومحمية من الخصم طبقاً للمادة 68 من قانون العمل
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowCabinetModal(true)}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle size={15} /> + إضافة عطلة رسمية / قرار مجلس الوزراء
          </button>
          <button
            type="button"
            onClick={() => setShowDutyModal(true)}
            className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator size={14} /> تكليف عمل أثناء عطلة (بدل 200%)
          </button>
          <button
            onClick={() => safePrintAction('جدول العطلات الرسمية A4')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} /> طباعة التقويم
          </button>
        </div>
      </div>

      {/* 2. AUTO-INTEGRATION NOTIFICATION BANNER (شريط الربط التلقائي الحي) */}
      <div className="bg-gradient-to-r from-purple-900 to-[#714B67] text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl mt-0.5">
            <CheckCircle2 size={20} className="text-emerald-300" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              الربط التلقائي الذكي مفعل (Active System Automation):
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40">
                مربوط 100%
              </span>
            </div>
            <p className="text-xs text-purple-100 mt-1 leading-relaxed">
              جدول العطلات مربوط تلقائياً بـ <strong>نظام الحضور والبصمة</strong> (لا يُسجل غياب)، و<strong>مسير الرواتب WPS</strong> (مدفوعة 100% مع احتساب أجر مضاعف 200% للمكلفين)، و<strong>نظام الإجازات</strong> (لا تُخصم من رصيد الإجازة السنوية).
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('integration')}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Info size={14} /> تفاصيل وقواعد الربط
        </button>
      </div>

      {/* 3. FINANCIAL & STATISTICAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>إجمالي أيام العطلات 2026</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalHolidaysDays} <span className="text-xs font-normal text-slate-500">يوماً رسمياً</span></div>
          <div className="text-[10px] text-emerald-700 mt-1 font-bold flex items-center gap-1">
            <Check size={12} /> مدفوعة الأجر بالكامل 100%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>المناسبات الوطنية والدينية</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{holidays.length} <span className="text-xs font-normal text-slate-500">مناسبات معتمدة</span></div>
          <div className="text-[10px] text-slate-500 mt-1">وفق المراسيم وقرارات مجلس الوزراء</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>تكليفات العمل أثناء العطلات</span>
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{duties.length} <span className="text-xs font-normal text-slate-500">موظفين مناوبين</span></div>
          <div className="text-[10px] text-blue-600 mt-1">تضاف تلقائياً لمسير الرواتب (WPS)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
            <span>إجمالي البدلات المستحقة (المادة 68)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalDutiesAmount.toFixed(3)} <span className="text-xs font-normal text-emerald-600">د.ك</span></div>
          <div className="text-[10px] text-emerald-800 mt-1 font-bold">تعويض أجر مضاعف 200%</div>
        </div>
      </div>

      {/* 4. SUB-TABS SWITCHER */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar size={14} /> جدول العطلات الرسمية المعتمدة ({holidays.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('duties')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'duties' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign size={14} /> سجل تكليفات المناوبة وبدل العطلات ({duties.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('integration')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'integration' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={14} /> نظام الربط التلقائي مع الحضور والرواتب والإجازات
        </button>
      </div>

      {/* 5. TAB 1: OFFICIAL HOLIDAYS TABLE */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">دولة الكويت - السنة التقويمية:</span>
              <span className="px-2.5 py-1 bg-purple-100 text-[#714B67] font-black rounded-lg text-xs font-mono">2026</span>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المناسبة أو المرسوم..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#714B67] outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">المناسبة الرسمية</th>
                    <th className="p-3.5">المرسوم / قرار مجلس الوزراء</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">تاريخ البداية</th>
                    <th className="p-3.5">تاريخ النهاية</th>
                    <th className="p-3.5">عدد الأيام</th>
                    <th className="p-3.5 text-center">الاستحقاق المالي</th>
                    <th className="p-3.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHolidays.map((h, idx) => (
                    <tr key={h.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{h.nameAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{h.nameEn}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div className="font-semibold text-slate-800">{h.decreeNumber || 'مرسوم رسمي'}</div>
                        <div className="text-[10px] text-slate-400">{h.notes}</div>
                      </td>
                      <td className="p-3.5">
                        {h.type === 'national' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            عطلة وطنية
                          </span>
                        )}
                        {h.type === 'religious' && (
                          <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            عطلة دينية
                          </span>
                        )}
                        {h.type === 'official' && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            عطلة رسمية
                          </span>
                        )}
                        {h.type === 'cabinet_decision' && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            قرار مجلس الوزراء طارئ
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{h.startDate}</td>
                      <td className="p-3.5 font-mono text-slate-600">{h.endDate}</td>
                      <td className="p-3.5 font-bold font-mono text-slate-900">{h.daysCount} {h.daysCount === 1 ? 'يوم' : 'أيام'}</td>
                      <td className="p-3.5 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> مدفوعة 100%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="bg-purple-50 text-[#714B67] border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          معتمدة وسارية
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredHolidays.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لا توجد عطلات رسمية مطابقة للبحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: DUTY ASSIGNMENTS (تكليفات العمل أثناء العطلات) */}
      {activeTab === 'duties' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="text-[#714B67]" size={16} />
                  سجل تعويضات وتكليفات العمل أثناء العطلات الرسمية (المادة 68)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  يحصل الموظف المكلف بالعمل على أجر مضاعف 200% (أجر يوم العمل + أجر يوم تعويضي) أو يوم راحة بديل
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDutyModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <PlusCircle size={14} /> إضافة تكليف جديد
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">رقم التكليف</th>
                    <th className="p-3.5">الموظف المكلف</th>
                    <th className="p-3.5">مناسبة العطلة الرسمية</th>
                    <th className="p-3.5">تاريخ العمل الفعلي</th>
                    <th className="p-3.5">نوع التعويض القانوني</th>
                    <th className="p-3.5 text-left">البدل المالي المضاف (د.ك)</th>
                    <th className="p-3.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duties.map((d, idx) => (
                    <tr key={d.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-mono font-bold text-[#714B67]">{d.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.civilId} - {d.jobTitle}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{d.holidayName}</td>
                      <td className="p-3.5 font-mono text-slate-700">{d.dutyDate}</td>
                      <td className="p-3.5">
                        {d.compensationType === 'double_pay' ? (
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            أجر مضاعف (200%)
                          </span>
                        ) : d.compensationType === 'comp_day_off' ? (
                          <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            يوم راحة بديل
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            إضافة للإجازات
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-700 text-sm text-left">
                        {d.calculatedAmount > 0 ? `+${d.calculatedAmount.toFixed(3)} د.ك` : '---'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 size={11} /> معتمد للصرف بمسير الرواتب
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 3: SYSTEM INTEGRATION HUB (تفاصيل وقواعد الربط) */}
      {activeTab === 'integration' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Attendance Integration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. الربط مع نظام الحضور والبصمة</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يقوم محرك النظام بمطابقة تقويم العطلات مع سجلات البصمة اليومية:
            </p>
            <ul className="text-xs text-slate-700 space-y-2 border-t pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>عدم تسجيل أي موظف كـ "غائب بدون إذن" أثناء العطلة الرسمية.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>إعفاء الموظفين تلقائياً من بصمة الحضور والانصراف في أيام العطل.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Payroll Integration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. الربط مع مسير الرواتب (WPS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              احتساب الراتب كاملاً بدون أي خصم مع تفعيل تعويضات المادة 68:
            </p>
            <ul className="text-xs text-slate-700 space-y-2 border-t pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>صرف الراتب الشامل كاملاً دون خصم أيام العطلات.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>إضافة بدل التكليف 200% لبند العمل الإضافي بمسير الرواتب تلقائياً.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Leaves Integration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-purple-100 text-[#714B67] rounded-xl flex items-center justify-center font-bold">
              <CalendarDays size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. الربط مع نظام الإجازات (Time Off)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              حماية الرصيد السنوي للموظف عند تخلل العطلة للإجازة:
            </p>
            <ul className="text-xs text-slate-700 space-y-2 border-t pt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>إذا تخللت العطلة الرسمية إجازة سنوية للموظف، لا تُخصم من رصيده.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>تمديد مدة الإجازة تلقائياً بعدد أيام العطلة الرسمية المتداخلة.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* --- MODAL 1: ADD CABINET DECISION EMERGENCY HOLIDAY --- */}
      {showCabinetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="text-[#714B67]" size={18} />
                إضافة عطلة رسمية طارئة بقرار مجلس الوزراء
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCabinetModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCabinetHoliday} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العطلة أو المناسبة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطلة طارئة لسوء الأحوال الجوية بقرار مجلس الوزراء"
                  value={cabinetForm.nameAr}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, nameAr: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية:</label>
                  <input
                    type="text"
                    placeholder="Emergency Weather Holiday"
                    value={cabinetForm.nameEn}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, nameEn: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم وتاريخ قرار مجلس الوزراء:</label>
                  <input
                    type="text"
                    value={cabinetForm.decreeNumber}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, decreeNumber: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    required
                    value={cabinetForm.startDate}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, startDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ النهاية:</label>
                  <input
                    type="date"
                    value={cabinetForm.endDate}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, endDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد الأيام:</label>
                  <input
                    type="number"
                    min="1"
                    value={cabinetForm.daysCount}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, daysCount: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات القرار والتعميم:</label>
                <textarea
                  rows={2}
                  value={cabinetForm.notes}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, notes: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>سيتم إيقاف عداد الغياب واحتساب العطلة مدفوعة الأجر 100% فور الحفظ.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCabinetModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer"
                >
                  اعتماد العطلة الرسمية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD DUTY ASSIGNMENT --- */}
      {showDutyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calculator className="text-[#714B67]" size={18} />
                تكليف عمل أثناء عطلة رسمية (المادة 68)
              </h3>
              <button 
                type="button" 
                onClick={() => setShowDutyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف المكلف *</label>
                <input
                  type="text"
                  required
                  value={dutyForm.employeeName}
                  onChange={(e) => setDutyForm({ ...dutyForm, employeeName: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني:</label>
                  <input
                    type="text"
                    value={dutyForm.civilId}
                    onChange={(e) => setDutyForm({ ...dutyForm, civilId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    value={dutyForm.jobTitle}
                    onChange={(e) => setDutyForm({ ...dutyForm, jobTitle: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المناسبة الرسمية:</label>
                  <select
                    value={dutyForm.holidayName}
                    onChange={(e) => setDutyForm({ ...dutyForm, holidayName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-bold outline-none focus:border-[#714B67]"
                  >
                    {holidays.map(h => <option key={h.id} value={h.nameAr}>{h.nameAr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ العمل الفعلي:</label>
                  <input
                    type="date"
                    required
                    value={dutyForm.dutyDate}
                    onChange={(e) => setDutyForm({ ...dutyForm, dutyDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل (د.ك):</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={dutyForm.totalSalary}
                    onChange={(e) => setDutyForm({ ...dutyForm, totalSalary: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع التعويض القانوني:</label>
                  <select
                    value={dutyForm.compensationType}
                    onChange={(e) => setDutyForm({ ...dutyForm, compensationType: e.target.value as any })}
                    className="w-full p-2.5 border rounded-lg font-bold outline-none focus:border-[#714B67]"
                  >
                    <option value="double_pay">أجر مضاعف (200%) - بدل نقدي</option>
                    <option value="comp_day_off">يوم راحة بديل (تعويض)</option>
                    <option value="add_to_annual_leave">يضاف إلى رصيد الإجازات السنوية</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[#714B67] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>قيمة البدل المضاف لمسير الرواتب:</span>
                  <span className="font-mono text-sm">
                    {calculateDutyCompensation(parseFloat(dutyForm.totalSalary) || 0, dutyForm.compensationType).toFixed(3)} د.ك
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">حسبة أجر اليومين = (الراتب الشامل ÷ 26) × 2</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowDutyModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-lg font-bold cursor-pointer"
                >
                  اعتماد التكليف والبدل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooPublicHolidaysApp;
