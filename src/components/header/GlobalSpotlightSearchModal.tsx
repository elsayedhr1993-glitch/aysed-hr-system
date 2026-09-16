import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Users, Scan, FileText, Calendar, Clock, 
  CreditCard, Sparkles, Building2, ArrowRight, X, 
  Calculator, CheckCircle2, Shield, FolderArchive,
  Stethoscope, ShieldCheck
} from 'lucide-react';

interface GlobalSpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  onSelectEmployee: (employee: any) => void;
  onNavigateToApp: (appId: string) => void;
  onTriggerAction: (action: string) => void;
}

export const GlobalSpotlightSearchModal: React.FC<GlobalSpotlightSearchModalProps> = ({
  isOpen,
  onClose,
  employees = [],
  onSelectEmployee,
  onNavigateToApp,
  onTriggerAction
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const apps = [
    { id: 'employees', name: 'شؤون الموظفين (Employees Directory)', icon: Users, category: 'apps' },
    { id: 'recruitment', name: 'التوظيف والمقابلات الذكية وفرز السير الذاتية (Recruitment & ATS)', icon: Users, category: 'apps' },
    { id: 'contracts', name: 'عقود العمل والبدلات الرسمية وقانون العمل (Employment Contracts)', icon: FileText, category: 'apps' },
    { id: 'attendance', name: 'الحضور والانصراف والبصمة (Time & Attendance)', icon: Clock, category: 'apps' },
    { id: 'leaves', name: 'الإجازات والغياب (Time Off & Leaves)', icon: Calendar, category: 'apps' },
    { id: 'payroll', name: 'الرواتب وحماية الأجور WPS (Payroll & EOS)', icon: CreditCard, category: 'apps' },
    { id: 'scanner', name: 'الماسح الضوئي الذكي (Document Scanner OCR)', icon: Scan, category: 'apps' },
    { id: 'archive', name: 'أرشيف المستندات والوثائق (Documents Archive)', icon: FolderArchive, category: 'apps' },
    { id: 'letters', name: 'النماذج والخطابات الرسمية (Templates & Letters)', icon: FileText, category: 'apps' },
    { id: 'holidays', name: 'العطلات الرسمية الكويتية (Public Holidays)', icon: Sparkles, category: 'apps' },
    { id: 'reports', name: 'التقارير والتحليلات ولوحة القيادة (Reports & Analytics & Pivot)', icon: Sparkles, category: 'apps' },
    { id: 'moh', name: 'تراخيص وزارة الصحة والكادر الطبي (MOH Medical Hub)', icon: Stethoscope, category: 'apps' },
    { id: 'audit', name: 'سجل الرقابة وتتبع العمليات وفحص الجاهزية (Audit Logs & Diagnostics)', icon: ShieldCheck, category: 'apps' },
    { id: 'settings', name: 'بيانات المنشأة والإعدادات (Settings)', icon: Building2, category: 'apps' }
  ];

  const quickActions = [
    { id: 'calculator', name: 'فتح حاسبة قانون العمل الكويتي ومكافأة نهاية الخدمة', icon: Calculator, category: 'actions' },
    { id: 'new_employee', name: 'تسجيل وتعيين موظف جديد (New Employee)', icon: Users, category: 'actions' },
    { id: 'new_contract', name: 'إصدار أو تعديل عقد عمل قانوني', icon: FileText, category: 'actions' },
    { id: 'scanner', name: 'تشغيل كاميرا الماسح الضوئي للبطاقات المدنية والجوازات', icon: Scan, category: 'actions' }
  ];

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...quickActions.map(a => ({ ...a, type: 'action' })),
        ...apps.slice(0, 4).map(a => ({ ...a, type: 'app' }))
      ];
    }

    const matchedEmployees = employees.filter(emp => {
      const nameAr = (emp.fullNameAr || emp.nameAr || emp.name || '').toLowerCase();
      const nameEn = (emp.fullNameEn || emp.nameEn || '').toLowerCase();
      const civil = (emp.civilId || emp.civil_id_number || '').toLowerCase();
      const job = (emp.jobTitle || '').toLowerCase();
      const dept = (emp.department || emp.dept || '').toLowerCase();
      const phone = (emp.phone || '').toLowerCase();
      const code = (emp.employeeCode || emp.code || '').toLowerCase();

      return nameAr.includes(q) || nameEn.includes(q) || civil.includes(q) || job.includes(q) || dept.includes(q) || phone.includes(q) || code.includes(q);
    }).slice(0, 8).map(emp => ({
      id: emp.id,
      name: emp.fullNameAr || emp.nameAr || emp.name || 'موظف',
      subtitle: `${emp.jobTitle || 'موظف'} • ${emp.department || 'إدارة'} • مدني: ${emp.civilId || emp.civil_id_number || '---'}`,
      empData: emp,
      type: 'employee',
      icon: Users
    }));

    const matchedApps = apps.filter(app => 
      app.name.toLowerCase().includes(q)
    ).map(a => ({ ...a, type: 'app' }));

    const matchedActions = quickActions.filter(act => 
      act.name.toLowerCase().includes(q)
    ).map(act => ({ ...act, type: 'action' }));

    return [...matchedEmployees, ...matchedApps, ...matchedActions];
  }, [query, employees]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length]);

  const handleSelect = (item: any) => {
    if (!item) return;
    onClose();

    if (item.type === 'employee') {
      onSelectEmployee(item.empData);
    } else if (item.type === 'app') {
      onNavigateToApp(item.id);
    } else if (item.type === 'action') {
      onTriggerAction(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-16 sm:pt-24 dir-rtl" 
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-150 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="text-[#714B67] w-5 h-5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="بحث فوري في الموظفين بالاسم أو الرقم المدني أو الهاتف، والتطبيقات والإجراءات..."
            className="w-full bg-transparent text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-200/60 font-bold"
            >
              مسح
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 max-h-[55vh]">
          {filteredResults.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-1">
              <p className="font-bold text-sm text-slate-700">لم يتم العثور على أي نتائج مطابقة</p>
              <p className="text-[11px] text-slate-400">جرب البحث باسم موظف، أرقام البطاقة المدنية، أو اسم تطبيق مثل "رواتب"</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon || Users;

              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'bg-purple-50 text-[#714B67] border border-purple-200/80 shadow-xs' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'employee' 
                        ? 'bg-emerald-100 text-emerald-800 font-bold' 
                        : item.type === 'action'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-[#714B67]'
                    }`}>
                      <IconComp size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs truncate">{item.name}</span>
                        {item.type === 'employee' && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            موظف
                          </span>
                        )}
                        {item.type === 'action' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            إجراء فوري
                          </span>
                        )}
                        {item.type === 'app' && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                            تطبيق
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {(item as any).subtitle || (item.type === 'app' ? 'تطبيق نظام أودو' : 'وظيفة سريعة')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <span className="text-[10px] hidden sm:inline">انتقال</span>
                    <ArrowRight size={14} className="transform rotate-180" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>استخدم الأسهم <strong>↑</strong> <strong>↓</strong> للتنقل</span>
            <span>•</span>
            <span>اضغط <strong>Enter</strong> للاختيار</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Ctrl + K</span>
        </div>

      </div>
    </div>
  );
};

export default GlobalSpotlightSearchModal;
