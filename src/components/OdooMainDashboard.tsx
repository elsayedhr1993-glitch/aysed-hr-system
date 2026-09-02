import React from 'react';
import { 
  Users, 
  FileText, 
  CalendarDays, 
  CreditCard, 
  Fingerprint, 
  ShieldCheck, 
  FileCheck, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Building2,
  Briefcase,
  Package,
  Plane,
  FolderKanban
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

interface OdooMainDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const OdooMainDashboard: React.FC<OdooMainDashboardProps> = ({ onNavigate }) => {
  const { activeCompany } = useCompany();

  // Odoo Enterprise Modules Config
  const apps = [
    {
      id: 'employees',
      nameAr: 'الموظفون والعقود',
      nameEn: 'Employees & Contracts',
      icon: Users,
      color: 'bg-purple-600',
      badge: '2 موظف',
      description: 'سجلات الموظفين، العقود، والوثائق المدنية'
    },
    {
      id: 'leaves',
      nameAr: 'الإجازات والأرصدة',
      nameEn: 'Time Off & Leaves',
      icon: CalendarDays,
      color: 'bg-emerald-600',
      badge: '1 معلق',
      description: 'إدارة الإجازات السنوية والمرضية ورصيد 30 يوم'
    },
    {
      id: 'leave_settlement',
      nameAr: 'تسوية مستحقات الإجازة',
      nameEn: 'Leave Settlement (Art 71)',
      icon: Plane,
      color: 'bg-indigo-700',
      badge: 'المادة 71',
      description: 'تسوية وحساب راتب الإجازة مقدماً والتذكرة قبل السفر'
    },
    {
      id: 'holidays',
      nameAr: 'العطلات والبدلات الرسمية',
      nameEn: 'Public Holidays & Overtime',
      icon: CalendarDays,
      color: 'bg-pink-700',
      badge: 'المادة 68',
      description: 'حساب بدل المناوبات والعمل الإضافي وتكليفات العطل الرسمية'
    },
    {
      id: 'company_docs',
      nameAr: 'مستندات وتراخيص المؤسسة',
      nameEn: 'Company Documents & Licenses',
      icon: FolderKanban,
      color: 'bg-teal-700',
      badge: 'التراخيص والعقود',
      description: 'تتبع صلاحيات وثائق الشركة والتراخيص الطبية والتجارية'
    },
    {
      id: 'payroll',
      nameAr: 'الرواتب وحماية الأجور',
      nameEn: 'Kuwait WPS & Payroll',
      icon: CreditCard,
      color: 'bg-blue-600',
      badge: 'جاهز للإصدار',
      description: 'مسيرات الرواتب وملفات SIF للبنوك والتأمينات'
    },
    {
      id: 'attendance',
      nameAr: 'البصمة والحضور',
      nameEn: 'Biometric Attendance',
      icon: Fingerprint,
      color: 'bg-amber-600',
      badge: 'ZKTeco متصل',
      description: 'تسجيل الحضور اللحظي، الورديات، والغياب'
    },
    {
      id: 'operations',
      nameAr: 'العهد والعمليات والجزاءات',
      nameEn: 'HR Operations & Assets',
      icon: Package,
      color: 'bg-teal-600',
      badge: 'العهد والسلف',
      description: 'إدارة العهد العينية، سلف الرواتب والإنذارات ونهاية الخدمة'
    },
    {
      id: 'security_guards',
      nameAr: 'الأمن وحراس الورديات',
      nameEn: 'Security & Shifts',
      icon: ShieldCheck,
      color: 'bg-indigo-600',
      badge: '2 بالخدمة',
      description: 'توزيع الحراسات، النقاط الأمنية، والنوبات'
    },
    {
      id: 'templates',
      nameAr: 'القوالب والمراسلات',
      nameEn: 'Documents & Letters',
      icon: FileCheck,
      color: 'bg-rose-600',
      badge: '4 نماذج',
      description: 'شهادات الراتب، كتب الوزارات، والمخالصات'
    },
    {
      id: 'settings',
      nameAr: 'الإعدادات العامة',
      nameEn: 'Core Configurations',
      icon: Settings,
      color: 'bg-slate-700',
      badge: 'Kuwait v2026',
      description: 'بيانات المنشأة، الأمان 2FA، ومفاتيح النظام'
    }
  ];

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Odoo Enterprise Welcome Banner */}
      <div className="bg-gradient-to-l from-[#714B67] to-[#4c2f45] text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-purple-200 text-xs font-bold">
              <Building2 size={16} />
              <span>المنشأة النشطة: {activeCompany?.nameAr || 'الشركة الرئيسية'}</span>
            </div>
            <h1 className="text-2xl font-black">لوحة التحكم الرئيسية (Odoo HR Hub)</h1>
            <p className="text-xs text-purple-100/90 mt-1 max-w-xl font-medium">
              نظام إدارة الموارد البشرية والمؤسسات المتكامل وفق قانون العمل الكويتي رقم 6 لسنة 2010 ونظام حماية الأجور (WPS).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] text-purple-200">الرقم المدني / السجل</div>
              <div className="font-mono font-bold text-sm">{activeCompany?.crNumber || '201934'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] text-purple-200">حالة الربط</div>
              <div className="font-bold text-sm text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> سحابي آمن
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts Bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="text-amber-600 w-4 h-4 flex-shrink-0" />
          <span><strong>تنبيه إداري:</strong> إقامة الموظف (محمد إبراهيم السيد) تنتهي خلال 25 يوماً. يرجى تجديد الترخيص والإقامة في الشؤون.</span>
        </div>
        <button 
          onClick={() => onNavigate('employees')}
          className="text-xs font-bold text-[#714B67] hover:underline whitespace-nowrap mr-2"
        >
          مراجعة السجل
        </button>
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>إجمالي القوة العاملة</span>
            <Users className="w-4 h-4 text-[#714B67]" />
          </div>
          <div className="text-2xl font-black text-slate-900">2 <span className="text-xs font-normal text-slate-500">موظفين</span></div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> عقود سارية 100%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>مسير الرواتب الإجمالي (WPS)</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">2,500.000 <span className="text-xs font-normal text-slate-500">د.ك</span></div>
          <div className="text-[10px] text-blue-600 mt-1">شامل البدلات والتأمينات</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>نسبة حضور اليوم</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <div className="text-[10px] text-slate-400 mt-1">تزامن حي مع أجهزة ZKTeco</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>الورديات ونقاط الحراسة</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">3 <span className="text-xs font-normal text-slate-500">مواقع مؤمنة</span></div>
          <div className="text-[10px] text-purple-600 mt-1">تغطية أمنية على مدار الساعة</div>
        </div>
      </div>

      {/* Odoo Enterprise App Launcher (مشغل التطبيقات) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
            تطبيقات المنظومة الإدارية (Odoo Apps Suite)
          </h2>
          <span className="text-[11px] text-slate-400">انقر على أي تطبيق لفتحه فوراً</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => onNavigate(app.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#714B67] hover:shadow-md transition-all text-right group flex flex-col justify-between h-44 relative overflow-hidden cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${app.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-purple-50 group-hover:text-[#714B67] text-slate-600 px-2 py-0.5 rounded-full transition">
                      {app.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#714B67] transition">
                    {app.nameAr}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#714B67] pt-2 border-t border-slate-100 transition w-full">
                  <span>فتح التطبيق</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OdooMainDashboard;
