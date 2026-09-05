import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, FileSignature, Calendar, Clock, 
  Banknote, Scale, FolderKanban, Zap, Building2, Sparkles, Scan,
  Briefcase, FileText, ShieldCheck, Bell, AlertTriangle, TrendingUp, Activity, PieChart as PieIcon, ArrowUpRight, BarChart3, MessageSquare
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

export const OdooAppLauncher: React.FC<OdooAppLauncherProps> = ({ onSelectApp, currentUserEmail = '', currentUserRole = '', activeCompany, stats }) => {
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserEmail.toLowerCase() === 'admin@aysed.com'.toLowerCase() || currentUserEmail.toLowerCase() === 'elsayedhr1993@gmail.com'.toLowerCase();
  const companyDisplayName = activeCompany?.nameAr || activeCompany?.nameEn || 'Aysed HR S 2026';
  const currentCompanyId = activeCompany?.id || 'comp-super-admin';

  // استخراج الموظفين الحقيقيين للشركة من الذاكرة المحلية
  const [realEmployees, setRealEmployees] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(`odoo_employees_v1_${currentCompanyId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

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
      const rawEmp = localStorage.getItem(`odoo_employees_v1_${currentCompanyId}`);
      if (rawEmp) setRealEmployees(JSON.parse(rawEmp));
      const rawLev = localStorage.getItem('odoo_leave_requests_v2');
      if (rawLev) setRealLeaves(JSON.parse(rawLev));
    } catch (e) {}
  }, [currentCompanyId]);

  // حساب توزيع الرواتب الفعلي طبقاً للعقود المسجلة
  const payrollDeptData = React.useMemo(() => {
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

  // حساب طلبات الإجازات الحقيقية
  const leavesStatusData = React.useMemo(() => {
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

  const apps = [
    {
      id: 'EMPLOYEES' as ActiveApp,
      titleAr: 'الموظفون',
      titleEn: 'Employees',
      icon: Users,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      badge: `${stats.employeesCount}`,
      description: 'السجلات، المباشرة، وقوالب المستندات',
    },
    {
      id: 'RECRUITMENT' as ActiveApp,
      titleAr: 'التوظيف',
      titleEn: 'Recruitment',
      icon: UserPlus,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      badge: `${stats.candidatesCount}`,
      description: 'المقابلات والسير الذاتية',
    },
    {
      id: 'CONTRACTS' as ActiveApp,
      titleAr: 'عقود العمل',
      titleEn: 'Contracts',
      icon: FileSignature,
      bgColor: 'bg-teal-50 text-teal-600 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      badge: `${stats.contractsCount}`,
      description: 'العقود والبدلات',
    },
    {
      id: 'LEAVES' as ActiveApp,
      titleAr: 'الإجازات',
      titleEn: 'Time Off',
      icon: Calendar,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      badge: `${stats.leavesPendingCount}`,
      description: 'استحقاق 2.5 يوم شهرياً',
    },
    {
      id: 'HOLIDAYS' as ActiveApp,
      titleAr: 'العطلات',
      titleEn: 'Holidays',
      icon: Calendar,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      badge: '13',
      description: 'العطلات الرسمية',
    },
    {
      id: 'SHIFTS' as ActiveApp,
      titleAr: 'جدولة الشفتات',
      titleEn: 'Shifts',
      icon: Calendar,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      iconBg: 'bg-cyan-600 text-white',
      badge: `${stats.shiftsCount || 0}`,
      description: 'إدارة الورديات',
    },
    {
      id: 'ATTENDANCE' as ActiveApp,
      titleAr: 'الحضور والدوام والاستئذان',
      titleEn: 'Attendance',
      icon: Clock,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      badge: 'بصمة',
      description: 'البصمة، الحركات اليومية، والاستئذان',
    },
    {
      id: 'PAYROLL' as ActiveApp,
      titleAr: 'الرواتب ونهاية الخدمة',
      titleEn: 'Payroll & EOS',
      icon: Banknote,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-200',
      iconBg: 'bg-[#714B67] text-white',
      badge: 'WPS',
      description: 'كشوف الأجور وحاسبة مكافأة المادة 51',
    },
    {
      id: 'REPORTS' as ActiveApp,
      titleAr: 'التقارير والتحليلات',
      titleEn: 'Reports & Pivot',
      icon: BarChart3,
      bgColor: 'bg-violet-50 text-violet-700 border-violet-200',
      iconBg: 'bg-violet-600 text-white',
      badge: 'Pivot & Graph',
      description: 'الجدول المحوري والرسوم البيانية',
    },
    {
      id: 'DOCUMENTS' as ActiveApp,
      titleAr: 'المستندات وOCR',
      titleEn: 'Documents',
      icon: FolderKanban,
      bgColor: 'bg-sky-50 text-sky-600 border-sky-200',
      iconBg: 'bg-sky-600 text-white',
      badge: `${stats.documentsCount}`,
      description: 'الأرشيف، الهويات، والرفع السريع',
    },
    {
      id: 'SCANNER_APP' as ActiveApp,
      titleAr: 'الماسح الضوئي الذكي',
      titleEn: 'Document Scanner',
      icon: Scan,
      bgColor: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      badge: 'OCR',
      description: 'مسح المستندات، استخراج البيانات، والأرشفة الفورية',
    },
    {
      id: 'CUSTODY_LOANS' as ActiveApp,
      titleAr: 'العهد والسلف',
      titleEn: 'Custody',
      icon: Briefcase,
      bgColor: 'bg-stone-100 text-stone-700 border-stone-200',
      iconBg: 'bg-stone-700 text-white',
      badge: `${stats.custodiesCount || 0}`,
      description: 'العهد والسلف والأقساط',
    },
    {
      id: 'AUDIT_LOGS' as ActiveApp,
      titleAr: 'سجل الرقابة',
      titleEn: 'Audit Logs',
      icon: ShieldCheck,
      bgColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconBg: 'bg-slate-700 text-white',
      badge: `${stats.auditLogsCount || 0}`,
      description: 'تتبع العمليات',
    },
    {
      id: 'SETTINGS' as ActiveApp,
      titleAr: isSuperAdmin ? 'الإعدادات العامة والشركات والربط' : 'بيانات المنشأة والإعدادات',
      titleEn: isSuperAdmin ? 'Settings & Integrations' : 'Company Profile & Settings',
      icon: Building2,
      bgColor: 'bg-zinc-100 text-zinc-700 border-zinc-300',
      iconBg: 'bg-zinc-700 text-white',
      badge: isSuperAdmin ? 'واتساب وأتمتة' : 'ملف المنشأة',
      description: isSuperAdmin ? 'إدارة الشركات، الاشتراكات، الأتمتة والواتساب' : 'بيانات المنشأة، السجل التجاري، والواتساب',
    },
    {
      id: 'SECURITY_GUARDS' as ActiveApp,
      titleAr: 'الأمن والورديات',
      titleEn: 'Security & Patrols',
      icon: ShieldCheck,
      bgColor: 'bg-purple-50 text-[#714B67] border-purple-200',
      iconBg: 'bg-[#714B67] text-white',
      badge: 'دورية',
      description: 'متابعة نوبات الحراسة، المواقع والالتزام البيومتري اللحظي',
    },
    {
      id: 'DOCUMENT_TEMPLATES' as ActiveApp,
      titleAr: 'قوالب ونماذج المستندات',
      titleEn: 'Document Templates',
      icon: FileText,
      bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'مراسلات',
      description: 'توليد وطباعة شهادات الراتب والكتب الرسمية آلياً',
    },
  ];

  return (
    <div className="dashboard-container w-full h-full bg-transparent flex flex-col items-center relative z-10 space-y-3" dir="rtl">
      
      {/* 🧩 Odoo Enterprise App Switcher Grid */}
      <div className="w-full max-w-5xl mx-auto py-8 lg:py-16">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-10 justify-items-center">
          {apps.filter((app) => {
            if (currentUserRole === 'EMPLOYEE') {
              return ['ATTENDANCE', 'LEAVES', 'DOCUMENTS'].includes(app.id);
            }
            return true;
          }).map((app) => {
            const IconComponent = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => onSelectApp(app.id)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none w-[90px] sm:w-[100px]"
              >
                <div className={`relative w-[76px] h-[76px] sm:w-[86px] sm:h-[86px] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 transform group-hover:-translate-y-1 ${app.iconBg} bg-gradient-to-br from-white/10 to-black/10 ring-1 ring-black/5`}>
                  <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-sm" strokeWidth={1.5} />
                  {app.badge && app.badge !== '0' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#f8fafc] shadow-sm">
                      {app.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-slate-700 group-hover:text-slate-900 text-xs sm:text-[13px] text-center leading-tight tracking-wide">
                  {app.titleAr}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📊 Odoo-Style Compact Charts Section */}

      <div className="w-full max-w-7xl space-y-2 pt-2 border-t border-slate-200">
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
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
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
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
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
                      <Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3 */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between max-h-[210px]">
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
      <div className="text-slate-500 text-[10px] text-center flex items-center justify-center gap-3 border-t border-slate-200 pt-2 max-w-7xl w-full font-medium">
        <span>عملة النظام: <strong className="font-mono text-slate-800">KWD (0.000)</strong></span>
        <span>•</span>
        <span>قانون العمل الكويتي: <strong className="text-slate-800">رقم 6 لسنة 2010</strong></span>
        <span>•</span>
        <span>بيئة العمل: <strong className="text-emerald-700">Dafthra ERP Active</strong></span>
      </div>

    </div>);
};

