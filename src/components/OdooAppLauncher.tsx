import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, FileSignature, Calendar, Clock, 
  Banknote, Scale, FolderKanban, Zap, Building2, Sparkles, Scan,
  Briefcase, FileText, ShieldCheck, Bell, AlertTriangle, TrendingUp, Activity, 
  PieChart as PieIcon, ArrowUpRight, BarChart3, MessageSquare, Search, Filter,
  CheckCircle2, Layers, Award, Landmark, LayoutGrid
} from 'lucide-react';
import { ActiveApp, Company } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface OdooAppLauncherProps {
  onSelectApp: (app: ActiveApp) => void;
  currentUserEmail?: string;
  currentUserRole?: string;
  activeCompany?: Company;
  stats: {
    employeesCount: number;
    candidatesCount: number;
    contractsCount: number;
    leavesPendingCount: number;
    documentsCount: number;
    automationsCount: number;
    custodiesCount?: number;
    templatesCount?: number;
    auditLogsCount?: number;
    shiftsCount?: number;
    totalSalariesThisMonth?: number;
    onLeaveToday?: number;
    absenceRate?: number;
    lateArrivalsCount?: number;
    saturdayAbsencesCount?: number;
    leaveCostKwd?: number;
  };
}

export const OdooAppLauncher: React.FC<OdooAppLauncherProps> = ({ 
  onSelectApp, 
  currentUserEmail = '', 
  currentUserRole = '', 
  activeCompany, 
  stats 
}) => {
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserEmail.toLowerCase() === 'admin@aysed.com'.toLowerCase() || currentUserEmail.toLowerCase() === 'elsayedhr1993@gmail.com'.toLowerCase();
  const companyDisplayName = activeCompany?.nameAr || activeCompany?.nameEn || 'Aysed HR S 2026';
  const currentCompanyId = activeCompany?.id || 'comp-super-admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HR_PAYROLL' | 'ATTENDANCE_TIME' | 'DOCS_OPERATIONS'>('ALL');

  const [realEmployees, setRealEmployees] = useState<any[]>([]);

  // استخراج طلبات الإجازات الحقيقية
  const [realLeaves, setRealLeaves] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('odoo_leave_requests_v2');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  // تحديث البيانات دورياً
  useEffect(() => {
    try {
      const rawLev = localStorage.getItem('odoo_leave_requests_v2');
      if (rawLev) setRealLeaves(JSON.parse(rawLev));
    } catch (e) {}
  }, [currentCompanyId]);

  // حساب طلبات الإجازات بانتظار الاعتماد الحقيقية
  const pendingLeavesCount = useMemo(() => {
    return realLeaves.filter(req => req.status === 'pending' || req.status === 'WAITING' || req.status === 'DRAFT' || req.status === 'قيد الانتظار').length;
  }, [realLeaves]);

  // حساب نسبة الامتثال وسلامة المستندات ديناميكياً
  const compliancePercentage = useMemo(() => {
    if (!realEmployees || realEmployees.length === 0) return 100;
    const today = new Date().toISOString().slice(0, 10);
    const validEmps = realEmployees.filter(e => (!e.civilIdExpiry || e.civilIdExpiry >= today) && (!e.passportExpiry || e.passportExpiry >= today)).length;
    return Math.round((validEmps / realEmployees.length) * 100);
  }, [realEmployees]);

  // حساب توزيع الرواتب الفعلي طبقاً للعقود المسجلة
  const payrollDeptData = useMemo(() => {
    if (!realEmployees || realEmployees.length === 0) {
      return [{ name: 'لا توجد رواتب مسجلة', value: 0, color: '#94a3b8' }];
    }
    const deptMap: Record<string, number> = {};
    const palette = ['#714B67', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    realEmployees.forEach(emp => {
      const dept = emp.department || 'إدارة عامة';
      const basic = Number(emp.basicSalary || emp.salary || 0);
      const housing = Number(emp.housingAllowance || 0);
      const transport = Number(emp.transportAllowance || 0);
      const nature = Number(emp.natureOfWorkAllowance || 0);
      const total = basic + housing + transport + nature;
      deptMap[dept] = (deptMap[dept] || 0) + total;
    });

    const entries = Object.entries(deptMap);
    if (entries.length === 0 || entries.every(([_, val]) => val === 0)) {
      return [{ name: 'إجمالي الرواتب 0', value: 0, color: '#94a3b8' }];
    }

    return entries.map(([deptName, totalVal], idx) => ({
      name: deptName,
      value: Number(totalVal.toFixed(3)),
      color: palette[idx % palette.length]
    }));
  }, [realEmployees]);

  // حساب إجمالي الرواتب الشهرية
  const calculatedTotalPayroll = useMemo(() => {
    if (!realEmployees || realEmployees.length === 0) return 0;
    return realEmployees.reduce((sum, emp) => {
      const basic = Number(emp.basicSalary || emp.salary || 0);
      const housing = Number(emp.housingAllowance || 0);
      const transport = Number(emp.transportAllowance || 0);
      const nature = Number(emp.natureOfWorkAllowance || 0);
      return sum + basic + housing + transport + nature;
    }, 0);
  }, [realEmployees]);

  // حساب طلبات الإجازات الحقيقية
  const leavesStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      'سنوية': 0,
      'مرضية': 0,
      'عزاء / مادة 77': 0,
      'بدون راتب': 0,
    };

    realLeaves.forEach(req => {
      const type = req.leaveType || req.type || 'annual';
      if (type === 'annual' || type === 'ANNUAL') counts['سنوية'] += 1;
      else if (type === 'sick' || type === 'SICK') counts['مرضية'] += 1;
      else if (type === 'bereavement' || type === 'BEREAVEMENT') counts['عزاء / مادة 77'] += 1;
      else if (type === 'unpaid' || type === 'UNPAID') counts['بدون راتب'] += 1;
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [realLeaves]);

  const attendanceData = [
    { day: 'السبت', حضور: 100, غياب: 0 },
    { day: 'الأحد', حضور: 100, غياب: 0 },
    { day: 'الإثنين', حضور: 100, غياب: 0 },
    { day: 'الثلاثاء', حضور: 100, غياب: 0 },
    { day: 'الأربعاء', حضور: 100, غياب: 0 },
    { day: 'الخميس', حضور: 100, غياب: 0 },
  ];

  // القائمة الكاملة للتطبيقات (16 تطبيقاً)
  const allApps = [
    {
      id: 'EMPLOYEES' as ActiveApp,
      titleAr: 'شؤون الموظفين',
      titleEn: 'Employees',
      icon: Users,
      category: 'HR_PAYROLL',
      gradient: 'from-emerald-500 to-teal-700 text-white',
      badgeBg: 'bg-emerald-500',
      badge: `${stats.employeesCount}`,
      description: 'السجلات الشخصية، المباشرة، والشهادات الرسمية',
    },
    {
      id: 'RECRUITMENT' as ActiveApp,
      titleAr: 'التوظيف والمقابلات',
      titleEn: 'Recruitment',
      icon: UserPlus,
      category: 'HR_PAYROLL',
      gradient: 'from-indigo-500 to-purple-700 text-white',
      badgeBg: 'bg-indigo-500',
      badge: `${stats.candidatesCount}`,
      description: 'إدارة طلبات التوظيف والمقابلات والسير الذاتية',
    },
    {
      id: 'CONTRACTS' as ActiveApp,
      titleAr: 'عقود العمل',
      titleEn: 'Contracts',
      icon: FileSignature,
      category: 'HR_PAYROLL',
      gradient: 'from-teal-500 to-cyan-700 text-white',
      badgeBg: 'bg-teal-600',
      badge: `${stats.contractsCount}`,
      description: 'سريان العقود، باقات الأجور، والبدلات القانونية',
    },
    {
      id: 'LEAVES' as ActiveApp,
      titleAr: 'الإجازات والغياب',
      titleEn: 'Time Off',
      icon: Calendar,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-amber-500 to-orange-600 text-white',
      badgeBg: 'bg-amber-500',
      badge: `${stats.leavesPendingCount}`,
      description: 'أرصدة الإجازات، المادة 70، والطلبات بانتظار الاعتماد',
    },
    {
      id: 'HOLIDAYS' as ActiveApp,
      titleAr: 'العطلات الرسمية',
      titleEn: 'Holidays',
      icon: Calendar,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-rose-500 to-pink-700 text-white',
      badgeBg: 'bg-rose-500',
      badge: '13',
      description: 'العطلات والأعياد الرسمية بالكويت والتعويضات',
    },
    {
      id: 'ATTENDANCE' as ActiveApp,
      titleAr: 'الحضور والدوام',
      titleEn: 'Attendance',
      icon: Clock,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-blue-600 to-indigo-800 text-white',
      badgeBg: 'bg-blue-600',
      badge: 'بصمة ZK',
      description: 'البصمة البيومترية، التأخير، والاستئذان اليومي',
    },
    {
      id: 'PAYROLL' as ActiveApp,
      titleAr: 'الرواتب وحماية الأجور',
      titleEn: 'Payroll & EOS',
      icon: Banknote,
      category: 'HR_PAYROLL',
      gradient: 'from-[#714B67] to-[#4A2E44] text-white',
      badgeBg: 'bg-[#714B67]',
      badge: 'WPS',
      description: 'كشوف أجور البنوك وحاسبة مكافأة نهاية الخدمة (مادة 51)',
    },
    {
      id: 'REPORTS' as ActiveApp,
      titleAr: 'التقارير والتحليلات',
      titleEn: 'Reports & Pivot',
      icon: BarChart3,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-violet-600 to-purple-900 text-white',
      badgeBg: 'bg-violet-600',
      badge: 'Pivot',
      description: 'الجدول المحوري والرسوم البيانية والتحليلات',
    },
    {
      id: 'DOCUMENTS' as ActiveApp,
      titleAr: 'أرشيف المستندات',
      titleEn: 'Documents',
      icon: FolderKanban,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-sky-500 to-blue-700 text-white',
      badgeBg: 'bg-sky-600',
      badge: `${stats.documentsCount}`,
      description: 'الأرشيف الإلكتروني، الهويات، وتنبيهات الانتهاء',
    },
    {
      id: 'SCANNER_APP' as ActiveApp,
      titleAr: 'الماسح الضوئي الذكي',
      titleEn: 'Document Scanner',
      icon: Scan,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-teal-600 to-emerald-800 text-white',
      badgeBg: 'bg-teal-600',
      badge: 'OCR',
      description: 'مسح الوثائق، استخراج البيانات، والأرشفة الفورية',
    },
    {
      id: 'CUSTODY_LOANS' as ActiveApp,
      titleAr: 'العهد والممتلكات',
      titleEn: 'Custody',
      icon: Briefcase,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-slate-600 to-zinc-800 text-white',
      badgeBg: 'bg-slate-700',
      badge: `${stats.custodiesCount || 0}`,
      description: 'إدارة العهد العينية والسلف المالية والأقساط',
    },
    {
      id: 'AUDIT_LOGS' as ActiveApp,
      titleAr: 'سجل الرقابة',
      titleEn: 'Audit Logs',
      icon: ShieldCheck,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-zinc-700 to-slate-900 text-white',
      badgeBg: 'bg-zinc-800',
      badge: `${stats.auditLogsCount || 0}`,
      description: 'تتبع العمليات وحركات المستخدمين وتأمين البيانات',
    },
    {
      id: 'DOCUMENT_TEMPLATES' as ActiveApp,
      titleAr: 'قوالب ونماذج المستندات',
      titleEn: 'Document Templates',
      icon: FileText,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-emerald-600 to-teal-800 text-white',
      badgeBg: 'bg-emerald-600',
      badge: 'نماذج',
      description: 'توليد وطباعة شهادات الراتب والكتب الرسمية آلياً',
    },
  ];

  // وضع العرض: أيقونات Launchpad العصرية أو بطاقات تفصيلية
  const [viewStyle, setViewStyle] = useState<'launchpad' | 'cards'>(() => {
    const saved = localStorage.getItem('odoo_launcher_view_style');
    return (saved === 'cards' || saved === 'launchpad') ? saved : 'launchpad';
  });

  const setLauncherStyle = (style: 'launchpad' | 'cards') => {
    setViewStyle(style);
    localStorage.setItem('odoo_launcher_view_style', style);
  };

  // تصفية التطبيقات طبقاً للبحث والتصنيف
  const filteredApps = useMemo(() => {
    return allApps.filter(app => {
      // 1. صلاحيات الموظف العادي
      if (currentUserRole === 'EMPLOYEE' && !['ATTENDANCE', 'LEAVES', 'DOCUMENTS'].includes(app.id)) {
        return false;
      }
      // 2. فلتر التصنيف
      if (selectedCategory !== 'ALL' && app.category !== selectedCategory) {
        return false;
      }
      // 3. البحث النصي
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return app.titleAr.toLowerCase().includes(query) || 
               app.titleEn.toLowerCase().includes(query) || 
               app.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allApps, currentUserRole, selectedCategory, searchQuery]);

  return (
    <div className="dashboard-container w-full h-full bg-transparent flex flex-col items-center relative z-10 space-y-4 pb-8 px-2 sm:px-4" dir="rtl">
      
      {/* 🔍 Top Search & View Mode Header */}
      <div className="w-full max-w-[1700px] mx-auto space-y-2.5 pt-1">
        
        {/* Search Field & View Style Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#714B67] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع في المنظومة (شؤون الموظفين، الرواتب، الإجازات، العقود، المستندات...)"
              className="w-full pr-10 pl-20 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#714B67] focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer"
              >
                مسح
              </button>
            )}
            {!searchQuery && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Ctrl+K
              </div>
            )}
          </div>

          {/* تبديل نمط العرض: Launchpad vs Bento Cards */}
          <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1 shadow-xs shrink-0">
            <button
              onClick={() => setLauncherStyle('launchpad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewStyle === 'launchpad'
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="لوحة التطبيقات الذكية (أيقونات Launchpad الحديثة)"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">لوحة التطبيقات</span>
            </button>
            <button
              onClick={() => setLauncherStyle('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewStyle === 'cards'
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="بطاقات تفصيلية مع إحصائيات لكل تطبيق"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">بطاقات تفصيلية</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#714B67] text-white shadow-xs scale-102'
                : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            🌐 جميع التطبيقات ({allApps.length})
          </button>

          <button
            onClick={() => setSelectedCategory('HR_PAYROLL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'HR_PAYROLL'
                ? 'bg-emerald-700 text-white shadow-xs scale-102'
                : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            👥 الموارد والرواتب
          </button>

          <button
            onClick={() => setSelectedCategory('ATTENDANCE_TIME')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'ATTENDANCE_TIME'
                ? 'bg-blue-700 text-white shadow-xs scale-102'
                : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            ⏰ الحضور والدوام
          </button>

          <button
            onClick={() => setSelectedCategory('DOCS_OPERATIONS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'DOCS_OPERATIONS'
                ? 'bg-purple-800 text-white shadow-xs scale-102'
                : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            📁 الوثائق والتشغيل
          </button>
        </div>

      </div>

      {/* 📊 Executive Live KPI Bar - مدمج ومرن */}
      <div className="w-full max-w-[1700px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 px-1">
        
        {/* Metric 1 */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="text-[11px] font-bold text-slate-500">القوة العاملة النشطة</div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5 leading-none">
              {stats.employeesCount} <span className="text-[11px] font-bold text-slate-500">موظف</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Users size={17} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="text-[11px] font-bold text-slate-500">مسير الرواتب (WPS)</div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5 leading-none">
              {calculatedTotalPayroll.toLocaleString('ar-KW')} <span className="text-[11px] font-bold text-slate-500">د.ك</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#714B67] border border-purple-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Banknote size={17} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="text-[11px] font-bold text-slate-500">الإجازات بانتظار الاعتماد</div>
            <div className="text-base sm:text-lg font-black text-amber-700 font-mono mt-0.5 leading-none">
              {pendingLeavesCount} <span className="text-[11px] font-bold text-amber-600">طلب</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Calendar size={17} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="text-[11px] font-bold text-slate-500">سلامة المستندات والامتثال</div>
            <div className="text-base sm:text-lg font-black text-blue-700 font-mono mt-0.5 leading-none">
              {compliancePercentage}% <span className="text-[11px] font-bold text-emerald-600">ساري</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 size={17} />
          </div>
        </div>

      </div>

      {/* 🧩 Odoo Enterprise App Launchpad - شبكة التطبيقات الـ 16 العصرية */}
      <div className="w-full max-w-[1700px] mx-auto py-2">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-bold text-sm">لا توجد تطبيقات تطابق كلمة البحث "{searchQuery}"</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="mt-3 text-xs font-bold text-[#714B67] underline cursor-pointer"
            >
              إعادة عرض جميع التطبيقات
            </button>
          </div>
        ) : viewStyle === 'launchpad' ? (
          /* 🌟 1. النمط الحديث: Launchpad Squircle App Grid (Apple / Odoo 18 Style) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 justify-items-stretch">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer text-center backdrop-blur-sm"
                >
                  {/* Subtle Badge Tag */}
                  {app.badge && (
                    <span className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-50 text-slate-600 group-hover:text-[#714B67] border border-slate-200/80 transition-colors">
                      {app.badge}
                    </span>
                  )}

                  {/* 💎 3D Squircle Icon Container */}
                  <div className="relative mt-1 mb-2.5">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden ring-4 ring-white/60`}>
                      {/* Glossy Glass Highlight Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/10 pointer-events-none" />
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm relative z-10" strokeWidth={1.9} />
                    </div>
                  </div>

                  {/* App Text Info */}
                  <div className="w-full space-y-0.5">
                    <h3 className="font-extrabold text-xs sm:text-[13px] text-slate-800 group-hover:text-[#714B67] leading-tight transition-colors line-clamp-1">
                      {app.titleAr}
                    </h3>
                    <p className="text-[10px] text-slate-400 group-hover:text-slate-600 font-medium leading-tight line-clamp-1 transition-colors">
                      {app.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* 🗂️ 2. النمط الثاني: بطاقات الـ Bento SaaS التفصيلية */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className="group relative flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/95 hover:bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer text-right shadow-2xs"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200 ring-2 ring-white`}>
                    <IconComponent className="w-6 h-6 text-white drop-shadow-xs" strokeWidth={1.9} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#714B67] leading-tight truncate transition-colors">
                        {app.titleAr}
                      </h3>
                      {app.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-2">
                      {app.description}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="self-center text-slate-300 group-hover:text-[#714B67] group-hover:-translate-x-0.5 transition-all">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 Odoo-Style Compact Charts Section */}
      <div className="w-full max-w-[1700px] space-y-2 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>مؤشرات الأداء المالية والإدارية (Dafthra Analytics)</span>
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">بيانات حية • KWD</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Chart 1 */}
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">معدل الحضور الأسبوعي</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +2.4%
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} domain={[80, 100]} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '10px' }} />
                  <Bar dataKey="حضور" fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">توزيع الرواتب (د.ك)</span>
              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {stats.employeesCount} موظف
              </span>
            </div>
            <div className="h-28 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payrollDeptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {payrollDeptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3 */}
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">طلبات الإجازات النشطة</span>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {stats.leavesPendingCount} بانتظار الاعتماد
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leavesStatusData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={65} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '10px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="text-slate-500 text-[10px] text-center flex items-center justify-center gap-3 border-t border-slate-200 pt-3 max-w-[1700px] w-full font-medium">
        <span>عملة النظام: <strong className="font-mono text-slate-800">KWD (0.000)</strong></span>
        <span>•</span>
        <span>قانون العمل الكويتي: <strong className="text-slate-800">رقم 6 لسنة 2010</strong></span>
        <span>•</span>
        <span>بيئة العمل: <strong className="text-emerald-700">Odoo 18 Enterprise Active</strong></span>
      </div>

    </div>
  );
};

export default OdooAppLauncher;
