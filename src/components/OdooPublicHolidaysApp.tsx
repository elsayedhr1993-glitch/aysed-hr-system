import React, { useState, useEffect, useMemo } from 'react';
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
  Flame,
  FileSpreadsheet,
  List,
  CalendarRange,
  BellRing,
  Send,
  Trash2
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';
import { saveHolidayWorkRecord, WorkOnHolidayRecord } from '../services/holidayWorkService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';

// Subcomponents
import { PrintableHolidayDutyModal } from './holidays/PrintableHolidayDutyModal';
import { HolidaysCalendarView } from './holidays/HolidaysCalendarView';
import { HolidayCircularModal } from './holidays/HolidayCircularModal';

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
  employeeId?: string;
  employeeName: string;
  civilId: string;
  jobTitle: string;
  department?: string;
  holidayName: string;
  dutyDate: string;
  basicSalary: number;
  totalSalary: number;
  compensationType: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave';
  calculatedAmount: number;
  status: 'approved' | 'settled';
  settledAt?: string;
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

const DEFAULT_SAMPLE_DUTIES: HolidayDutyAssignment[] = [];

export const OdooPublicHolidaysApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();
  const companyEmployees = employees && employees.length > 0 ? employees : [];

  const [holidays, setHolidays] = useState<PublicHoliday[]>(kuwaitOfficialHolidaysList);
  const [duties, setDuties] = useState<HolidayDutyAssignment[]>([]);

  const companyId = activeCompany?.id || 'comp-master';
  const holidayConfigId = `public_holidays_${companyId}`;

  useEffect(() => {
    let mounted = true;
    const loadHolidayState = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'system_config', holidayConfigId));
        if (!mounted) return;
        const data = snapshot.data() as { holidays?: PublicHoliday[]; duties?: HolidayDutyAssignment[] } | undefined;
        if (data?.holidays && Array.isArray(data.holidays) && data.holidays.length > 0) {
          setHolidays(data.holidays);
        } else {
          setHolidays(kuwaitOfficialHolidaysList);
        }
        if (data?.duties && Array.isArray(data.duties)) {
          setDuties(data.duties);
        } else {
          setDuties([]);
        }
      } catch (error) {
        console.error('Failed to load holidays config from Firestore', error);
        if (mounted) {
          setHolidays(kuwaitOfficialHolidaysList);
          setDuties([]);
        }
      }
    };
    void loadHolidayState();
    return () => {
      mounted = false;
    };
  }, [holidayConfigId]);

  useEffect(() => {
    void setDoc(
      doc(db, 'system_config', holidayConfigId),
      cleanFirestoreData({
        companyId,
        holidays,
        duties,
        updatedAt: new Date().toISOString()
      }),
      { merge: true }
    ).catch(error => console.error('Failed to persist holidays config to Firestore', error));
  }, [companyId, holidayConfigId, holidays, duties]);

  // View state: 'list' vs 'calendar' view
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  // Sub-tabs: 'holidays' vs 'duties'
  const [activeTab, setActiveTab] = useState<'holidays' | 'duties'>('holidays');
  const [searchQuery, setSearchQuery] = useState('');
  const [holidayTypeFilter, setHolidayTypeFilter] = useState<string>('all');

  // Modals state
  const [showCabinetModal, setShowCabinetModal] = useState(false);
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [selectedPrintDuty, setSelectedPrintDuty] = useState<HolidayDutyAssignment | null>(null);
  const [selectedCircularHoliday, setSelectedCircularHoliday] = useState<PublicHoliday | null>(null);

  // Cabinet Emergency Holiday Form
  const [cabinetForm, setCabinetForm] = useState({
    nameAr: '',
    nameEn: '',
    startDate: '2026-09-10',
    endDate: '2026-09-10',
    daysCount: '1',
    decreeNumber: 'قرار مجلس الوزراء رقم ( ) لسنة 2026',
    notes: 'عطلة رسمية طارئة بقرار مجلس الوزراء'
  });

  // Selected Employee for Duty Form
  const defaultEmp = companyEmployees[0];
  const [dutyForm, setDutyForm] = useState({
    employeeId: defaultEmp?.id || '',
    employeeName: defaultEmp?.name || (defaultEmp as any)?.fullNameAr || '',
    civilId: defaultEmp?.civilId || '',
    jobTitle: defaultEmp?.jobTitle || '',
    department: defaultEmp?.department || '',
    holidayName: holidays[0]?.nameAr || 'عطلة رسمية',
    dutyDate: holidays[0]?.startDate || '2026-09-10',
    totalSalary: String((defaultEmp as any)?.totalSalary || (defaultEmp as any)?.salary || 1000),
    compensationType: 'double_pay' as 'double_pay' | 'comp_day_off' | 'add_to_annual_leave'
  });

  const handleEmployeeSelectForDuty = (empId: string) => {
    const selected = companyEmployees.find(e => e.id === empId);
    if (selected) {
      setDutyForm({
        ...dutyForm,
        employeeId: selected.id,
        employeeName: selected.name || (selected as any).fullNameAr || '',
        civilId: selected.civilId || '',
        jobTitle: selected.jobTitle || 'موظف',
        department: selected.department || '',
        totalSalary: String((selected as any).totalSalary || (selected as any).salary || 1000)
      });
    }
  };

  // Calculate Article 68 Overtime ((Total Salary / 26) * 2)
  const calculateDutyCompensation = (salary: number, type: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave') => {
    if (type === 'comp_day_off' || type === 'add_to_annual_leave') return 0;
    const dayRate = salary / 26;
    return Math.round(dayRate * 2 * 1000) / 1000;
  };

  // Handle Add Cabinet Holiday
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
    toast.success(`تم اعتماد وإدراج العطلة الرسمية الطارئة (${created.nameAr}) بنجاح.`);
  };

  // Handle Create Duty Assignment
  const handleCreateDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    const salary = parseFloat(dutyForm.totalSalary) || 0;
    const amount = calculateDutyCompensation(salary, dutyForm.compensationType);

    const created: HolidayDutyAssignment = {
      id: `DUTY-2026-0${duties.length + 1}`,
      employeeId: dutyForm.employeeId,
      employeeName: dutyForm.employeeName,
      civilId: dutyForm.civilId,
      jobTitle: dutyForm.jobTitle,
      department: dutyForm.department,
      holidayName: dutyForm.holidayName,
      dutyDate: dutyForm.dutyDate,
      basicSalary: salary * 0.7,
      totalSalary: salary,
      compensationType: dutyForm.compensationType,
      calculatedAmount: amount,
      status: 'approved'
    };

    setDuties([created, ...duties]);

    // If compensatory day off or annual leave, automatically credit using holidayWorkService
    if (dutyForm.compensationType === 'comp_day_off' || dutyForm.compensationType === 'add_to_annual_leave') {
      try {
        await saveHolidayWorkRecord({
          employeeId: dutyForm.employeeId,
          companyId: activeCompany?.id || 'comp-master',
          date: dutyForm.dutyDate,
          holidayName: dutyForm.holidayName,
          hoursWorked: 8,
          compensationType: dutyForm.compensationType === 'add_to_annual_leave' ? 'ANNUAL_ACCRUAL' : 'COMP_OFF',
          state: 'approved'
        });
        toast.success(`تم اعتماد التكليف وإضافة (+1 يوم) لرصيد ${dutyForm.compensationType === 'comp_day_off' ? 'الراحات البديلة' : 'الإجازة السنوية'} للموظف تلقائياً.`);
      } catch (err) {
        console.warn('Failed to sync holiday work record', err);
      }
    } else {
      toast.success(`تم اعتماد التكليف وإدراج بدل نقدي (+${amount.toFixed(3)} د.ك) جاهز للترحيل للرواتب.`);
    }

    setShowDutyModal(false);
  };

  // Mark duty as settled to payroll WPS
  const handleSettleDutyToPayroll = (dutyId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setDuties(duties.map(d => d.id === dutyId ? { ...d, status: 'settled', settledAt: todayStr } : d));
    toast.success('تم ترحيل بدل العمل أثناء العطلة لملف مسير الرواتب (WPS) بنجاح.');
  };

  // Export to Excel
  const handleExportHolidaysExcel = () => {
    if (activeTab === 'holidays') {
      const data = holidays.map((h, i) => ({
        'م': i + 1,
        'رمز العطلة': h.id,
        'المناسبة الرسمية': h.nameAr,
        'الاسم بالإنجليزية': h.nameEn,
        'التصنيف': h.type === 'national' ? 'عطلة وطنية' : h.type === 'religious' ? 'عطلة دينية' : h.type === 'cabinet_decision' ? 'قرار مجلس الوزراء' : 'عطلة رسمية',
        'تاريخ البداية': h.startDate,
        'تاريخ النهاية': h.endDate,
        'عدد الأيام': h.daysCount,
        'المرسوم / السند': h.decreeNumber || 'مرسوم رسمي',
        'الاستحقاق المالي': 'مدفوعة الأجر 100%'
      }));
      exportToExcel(data, 'جدول_العطلات_الرسمية_الكويت_2026', 'العطلات الرسمية');
    } else {
      const data = duties.map((d, i) => ({
        'م': i + 1,
        'رقم التكليف': d.id,
        'اسم الموظف': d.employeeName,
        'الرقم المدني': d.civilId,
        'المسمى الوظيفي': d.jobTitle,
        'القسم': d.department || '---',
        'مناسبة العطلة': d.holidayName,
        'تاريخ التكليف': d.dutyDate,
        'الراتب الشامل': d.totalSalary,
        'نوع التعويض': d.compensationType === 'double_pay' ? 'أجر مضاعف 200%' : d.compensationType === 'comp_day_off' ? 'يوم راحة بديل' : 'إضافة للرصيد السنوي',
        'البدل المالي (د.ك)': d.calculatedAmount,
        'الحالة': d.status === 'settled' ? 'تم الصرف بمسير الرواتب' : 'معتمد بانتظار الصرف'
      }));
      exportToExcel(data, 'سجل_المكلفين_بالعمل_أثناء_العطلات_مادة68', 'تكليفات العطلات');
    }
  };

  // Filtered Holidays
  const filteredHolidays = holidays.filter(h => {
    const matchesSearch = 
      h.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.decreeNumber && h.decreeNumber.includes(searchQuery));

    const matchesType = holidayTypeFilter === 'all' || h.type === holidayTypeFilter;

    return matchesSearch && matchesType;
  });

  const totalHolidaysDays = holidays.reduce((acc, h) => acc + h.daysCount, 0);
  const totalDutiesAmount = duties.reduce((acc, d) => acc + d.calculatedAmount, 0);

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>العطلات الرسمية</span>
            <span>/</span>
            <span className="text-[#714B67] font-black">جدول العطلات والقرارات الرسمية للكويت (2026)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-[#714B67]" size={22} />
            تطبيق العطلات الرسمية وبدلات المادة 68 (Kuwait Public Holidays)
          </h1>
          <p className="text-[11px] text-slate-500">
            المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | مدفوعة الأجر 100% ومحمية طبقاً لقانون العمل رقم 6 لسنة 2010
          </p>
        </div>

        {/* Top Buttons: Clean & Functional */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          
          <button
            type="button"
            onClick={handleExportHolidaysExcel}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="تصدير السجل الحالي إلى ملف Excel"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCabinetModal(true)}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle size={15} /> + عطلة طارئة / قرار مجلس الوزراء
          </button>

          <button
            type="button"
            onClick={() => setShowDutyModal(true)}
            className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator size={14} /> تكليف عمل أثناء عطلة (المادة 68)
          </button>

          <button
            type="button"
            onClick={() => safePrintAction('جدول العطلات الرسمية A4')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} /> طباعة السجل
          </button>
        </div>
      </div>

      {/* 2. KPIs */}
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
          <div className="text-2xl font-black text-slate-900">{holidays.length} <span className="text-xs font-normal text-slate-500">مناسبة معتمدة</span></div>
          <div className="text-[10px] text-slate-500 mt-1">وفق المراسيم وقرارات مجلس الوزراء</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>تكليفات العمل (المادة 68)</span>
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{duties.length} <span className="text-xs font-normal text-slate-500">مناوبة عمل</span></div>
          <div className="text-[10px] text-blue-600 mt-1">مناوبات طبية وتشغيلية موثقة</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
            <span>إجمالي البدلات المالية المستحقة</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalDutiesAmount.toFixed(3)} <span className="text-xs font-normal text-emerald-600">د.ك</span></div>
          <div className="text-[10px] text-emerald-800 mt-1 font-bold">تحول لمسير الرواتب بنظام WPS</div>
        </div>

      </div>

      {/* 3. Navigation Controls & View Modes Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Main Tabs: Holidays vs Duties */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'holidays' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={14} /> جدول العطلات الرسمية ({holidays.length})
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('duties')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'duties' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={14} /> سجل تكليفات المناوبة وبدل العطلات ({duties.length})
          </button>
        </div>

        {/* View Mode Toggle (Only active on holidays tab) */}
        {activeTab === 'holidays' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#714B67]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} /> جدول رسمي
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white shadow-xs text-[#714B67]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange size={14} /> تقويم شهري تفاعلي
            </button>
          </div>
        )}

      </div>

      {/* 4. TAB 1: HOLIDAYS LIST OR CALENDAR */}
      {activeTab === 'holidays' && (
        <>
          {viewMode === 'list' && (
            <div className="space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'جميع المناسبات' },
                    { id: 'religious', label: 'عطلات دينية' },
                    { id: 'national', label: 'أعياد وطنية' },
                    { id: 'official', label: 'عطلات رسمية' },
                    { id: 'cabinet_decision', label: 'قرارات مجلس الوزراء' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setHolidayTypeFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        holidayTypeFilter === filter.id
                          ? 'bg-[#714B67] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
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
                        <th className="p-3.5 text-center">إجراءات وتعليمات</th>
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
                            <button
                              type="button"
                              onClick={() => setSelectedCircularHoliday(h)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              title="إصدار تعميم إداري رسمي للموظفين"
                            >
                              <BellRing size={11} /> تعميم إداري
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredHolidays.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                            لا توجد عطلات رسمية مطابقة للبحث أو الفلتر المحدد.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Interactive Visual Calendar View */}
          {viewMode === 'calendar' && (
            <HolidaysCalendarView
              holidays={holidays}
              duties={duties}
              onOpenCircularModal={(h) => setSelectedCircularHoliday(h)}
            />
          )}
        </>
      )}

      {/* 5. TAB 2: DUTIES & ARTICLE 68 COMPENSATIONS */}
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
                  يحصل الموظف المكلف بالعمل على أجر مضاعف 200% أو يوم راحة بديل معتمد (Comp-Off) يضاف لرصيد إجازاته
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDutyModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle size={14} /> إضافة تكليف عمل جديد
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3.5">رقم التكليف</th>
                    <th className="p-3.5">الموظف المكلف والقسم</th>
                    <th className="p-3.5">مناسبة العطلة الرسمية</th>
                    <th className="p-3.5">تاريخ العمل الفعلي</th>
                    <th className="p-3.5">نوع التعويض القانوني</th>
                    <th className="p-3.5 text-left">البدل المالي (د.ك)</th>
                    <th className="p-3.5 text-center">حالة الصرف والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duties.map((d, idx) => (
                    <tr key={d.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-mono font-bold text-[#714B67]">{d.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {d.civilId} - {d.jobTitle} {d.department ? `(${d.department})` : ''}
                        </div>
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
                            يوم راحة بديل (+1 يوم)
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            إضافة للرصيد السنوي (+1 يوم)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-700 text-sm text-left">
                        {d.calculatedAmount > 0 ? `+${d.calculatedAmount.toFixed(3)} د.ك` : '---'}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          
                          {/* Print Official Order Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedPrintDuty(d)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border"
                            title="طباعة أمر تكليف رسمي معتمد A4"
                          >
                            <Printer size={11} /> أمر تكليف A4
                          </button>

                          {/* Settle to Payroll WPS */}
                          {d.compensationType === 'double_pay' && (
                            d.status === 'settled' ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 size={11} /> رُحل للرواتب ({d.settledAt})
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSettleDutyToPayroll(d.id)}
                                className="px-2.5 py-1 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="ترحيل البدل المالي لمسير الرواتب WPS"
                              >
                                <Send size={11} /> ترحيل للرواتب (WPS)
                              </button>
                            )
                          )}

                          {(d.compensationType === 'comp_day_off' || d.compensationType === 'add_to_annual_leave') && (
                            <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={11} /> أضيف للرصيد
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                  {duties.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد تكليفات عمل أثناء العطلات مسجلة حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD CABINET DECISION EMERGENCY HOLIDAY --- */}
      {showCabinetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="text-[#714B67]" size={18} />
                إضافة عطلة رسمية طارئة بقرار مجلس الوزراء
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCabinetModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1"
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
                  className="w-full p-2.5 border rounded-xl outline-none focus:border-[#714B67] font-bold"
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
                    className="w-full p-2.5 border rounded-xl outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم وتاريخ قرار مجلس الوزراء:</label>
                  <input
                    type="text"
                    value={cabinetForm.decreeNumber}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, decreeNumber: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-bold outline-none focus:border-[#714B67]"
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
                    className="w-full p-2.5 border rounded-xl font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ النهاية:</label>
                  <input
                    type="date"
                    value={cabinetForm.endDate}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, endDate: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد الأيام:</label>
                  <input
                    type="number"
                    min="1"
                    value={cabinetForm.daysCount}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, daysCount: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات القرار والتعميم:</label>
                <textarea
                  rows={2}
                  value={cabinetForm.notes}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, notes: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>تدرج في التقويم وتوقف عدادات الغياب وتحسب مدفوعة الأجر 100% فور الحفظ.</span>
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
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  اعتماد العطلة الرسمية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD DUTY ASSIGNMENT (ARTICLE 68) --- */}
      {showDutyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calculator className="text-[#714B67]" size={18} />
                تكليف عمل أثناء عطلة رسمية (المادة 68)
              </h3>
              <button 
                type="button" 
                onClick={() => setShowDutyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="space-y-3.5">
              
              {/* Employee Selection Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف المكلف من قاعدة البيانات *</label>
                <select
                  required
                  value={dutyForm.employeeId}
                  onChange={(e) => handleEmployeeSelectForDuty(e.target.value)}
                  className="w-full p-2.5 border rounded-xl outline-none focus:border-[#714B67] font-bold bg-white"
                >
                  {companyEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) - {emp.jobTitle || 'موظف'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني:</label>
                  <input
                    type="text"
                    readOnly
                    value={dutyForm.civilId}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي والقسم:</label>
                  <input
                    type="text"
                    readOnly
                    value={`${dutyForm.jobTitle} ${dutyForm.department ? `(${dutyForm.department})` : ''}`}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المناسبة الرسمية:</label>
                  <select
                    value={dutyForm.holidayName}
                    onChange={(e) => setDutyForm({ ...dutyForm, holidayName: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-bold outline-none focus:border-[#714B67] bg-white"
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
                    className="w-full p-2.5 border rounded-xl font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل المقيد (د.ك):</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={dutyForm.totalSalary}
                    onChange={(e) => setDutyForm({ ...dutyForm, totalSalary: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-mono font-bold outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع التعويض القانوني (المادة 68):</label>
                  <select
                    value={dutyForm.compensationType}
                    onChange={(e) => setDutyForm({ ...dutyForm, compensationType: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl font-bold outline-none focus:border-[#714B67] bg-white"
                  >
                    <option value="double_pay">أجر مضاعف (200%) - بدل نقدي WPS</option>
                    <option value="comp_day_off">يوم راحة بديل (Comp-Off) يضاف للرصيد</option>
                    <option value="add_to_annual_leave">إضافة يوم إلى رصيد الإجازات السنوية</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Calculation Summary */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[#714B67] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>الأثر القانوني والمالي للتعويض:</span>
                  <span className="font-mono text-sm font-black">
                    {dutyForm.compensationType === 'double_pay' 
                      ? `+${calculateDutyCompensation(parseFloat(dutyForm.totalSalary) || 0, dutyForm.compensationType).toFixed(3)} د.ك` 
                      : '+1.0 يوم رصيد إجازة معتمد'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {dutyForm.compensationType === 'double_pay' 
                    ? 'احتساب أجر اليومين = (الراتب الشامل ÷ 26) × 2' 
                    : 'يضاف يوم راحة رسمي لرصيد الموظف يظهر تلقائياً بتطبيق الإجازات'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowDutyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  اعتماد التكليف والبدل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PRINTABLE OFFICIAL DUTY ORDER (A4) --- */}
      {selectedPrintDuty && (
        <PrintableHolidayDutyModal
          duty={selectedPrintDuty}
          onClose={() => setSelectedPrintDuty(null)}
          activeCompanyName={activeCompany?.nameAr || 'شركة المنارة المركزية'}
          pamFileNumber={activeCompany?.wsiCode || '12345678'}
          civilIdCompany={activeCompany?.civilIdCompany || '123456789012'}
        />
      )}

      {/* --- MODAL 4: OFFICIAL HOLIDAY CIRCULAR GENERATOR --- */}
      {selectedCircularHoliday && (
        <HolidayCircularModal
          holiday={selectedCircularHoliday}
          onClose={() => setSelectedCircularHoliday(null)}
          companyName={activeCompany?.nameAr || 'شركة المنارة المركزية'}
        />
      )}

    </div>
  );
};

export default OdooPublicHolidaysApp;
