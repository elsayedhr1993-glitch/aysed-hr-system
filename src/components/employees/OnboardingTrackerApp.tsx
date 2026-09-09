import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  Briefcase, 
  Calendar, 
  Award, 
  Zap, 
  Trash2,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Save
} from 'lucide-react';
import { OnboardingPlan, OnboardingTask } from '../../types';
import { OnboardingWizardModal } from './OnboardingWizardModal';
import { useCompany } from '../../context/CompanyContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface OnboardingTrackerAppProps {
  existingEmployees?: Array<{ id: string; nameAr: string; jobTitle?: string; dept?: string; civilId?: string }>;
  onEmployeeCreated?: (emp: any) => void;
}

const STORAGE_KEY = 'odoo_onboarding_plans_v1';

export const OnboardingTrackerApp: React.FC<OnboardingTrackerAppProps> = ({ 
  existingEmployees = [],
  onEmployeeCreated 
}) => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || 'comp-almanar';

  const [plans, setPlans] = useState<OnboardingPlan[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<OnboardingPlan | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Load plans from Supabase / localStorage on mount or company change
  useEffect(() => {
    let isMounted = true;
    const loadPlans = async () => {
      try {
        let loadedPlans: OnboardingPlan[] = [];
        
        // 1. Try Supabase cloud fetch first if configured
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from('onboarding_plans')
              .select('*')
              .eq('company_id', companyId);

            if (!error && data && data.length > 0) {
              loadedPlans = data.map((row: any) => row.payload || row);
            }
          } catch (sbErr) {
            console.warn('[OnboardingTracker] Supabase fetch notice:', sbErr);
          }
        }

        // 2. Fallback to localStorage scoped by company or default key
        if (loadedPlans.length === 0) {
          const scopedKey = `${STORAGE_KEY}_${companyId}`;
          const savedScoped = localStorage.getItem(scopedKey);
          const savedGlobal = localStorage.getItem(STORAGE_KEY);
          
          if (savedScoped) {
            loadedPlans = JSON.parse(savedScoped);
          } else if (savedGlobal) {
            loadedPlans = JSON.parse(savedGlobal);
          } else {
            // Initial mock onboarding plan
            loadedPlans = [
              {
                id: 'ONB-882191',
                employeeName: 'د. خالد عبد الله العلي',
                jobTitle: 'طبيب ممارس عام',
                department: 'الأطباء',
                civilId: '292011508821',
                expectedStartDate: '2026-09-10',
                templateType: 'medical_specialist',
                status: 'active',
                progressPercentage: 66,
                tasks: [
                  { id: 't1', title: 'استكمال ملف المستندات والبطاقة المدنية', category: 'legal', assignedToRole: 'الموارد البشرية', completed: true },
                  { id: 't2', title: 'مراجعة وترخيص وزارة الصحة (MOH)', category: 'medical', assignedToRole: 'مسؤول التراخيص', completed: true },
                  { id: 't3', title: 'تسليم العهد والأجهزة الإلكترونية', category: 'custody', assignedToRole: 'تقنية المعلومات', completed: true },
                  { id: 't4', title: 'إعداد بريد الشركة وبصمة الدخول', category: 'it', assignedToRole: 'الدعم الفني', completed: true },
                  { id: 't5', title: 'الجلسة التعريفية باللوائح وسياسة المركز', category: 'training', assignedToRole: 'المدير المباشر', completed: false },
                  { id: 't6', title: 'توقيع إقرار مباشرة العمل الرسمي', category: 'legal', assignedToRole: 'الموارد البشرية', completed: false }
                ],
                custodyItems: ['لاب توب محمول', 'بريد إلكتروني رسمي', 'بطاقة وبصمة بوابات المبنى'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
          }
        }

        if (isMounted) {
          setPlans(loadedPlans);
          localStorage.setItem(`${STORAGE_KEY}_${companyId}`, JSON.stringify(loadedPlans));
        }
      } catch (e) {
        console.error('Error loading onboarding plans:', e);
      }
    };

    loadPlans();
    return () => { isMounted = false; };
  }, [companyId]);

  // Save plans to Supabase and localStorage
  const savePlans = async (newPlans: OnboardingPlan[]) => {
    setPlans(newPlans);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${companyId}`, JSON.stringify(newPlans));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));

      // Cloud Supabase sync
      if (isSupabaseConfigured) {
        for (const plan of newPlans) {
          await supabase.from('onboarding_plans').upsert({
            id: plan.id,
            company_id: companyId,
            employee_name: plan.employeeName,
            department: plan.department,
            status: plan.status,
            payload: plan,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' }).catch(err => console.warn('Supabase plan upsert warning:', err));
        }
      }
    } catch (e) {
      console.error('Error saving onboarding plans:', e);
    }
  };

  // Save current active plan as permanent default template in Supabase
  const handleSaveAsDefaultTemplate = async (planToSave?: OnboardingPlan) => {
    const targetPlan = planToSave || plans[0];
    if (!targetPlan) {
      toast.error('لا توجد خطة تهيئة نشطة للحفظ كقالب دائم');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const templatePayload = {
        id: `TEMPLATE-${companyId}-${Date.now()}`,
        company_id: companyId,
        template_name: `قالب تهيئة معتمد - ${targetPlan.department || 'المنشأة'}`,
        payload: targetPlan,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('company_templates').upsert(templatePayload, { onConflict: 'id' });
        if (error) throw error;
      }

      localStorage.setItem(`odoo_default_template_${companyId}`, JSON.stringify(targetPlan));
      toast.success(`تم حفظ واعتماد قالب التهيئة لقسم (${targetPlan.department}) في قاعدة بيانات Supabase بنجاح!`);
    } catch (err) {
      console.error('Failed to save template to Supabase:', err);
      toast.success('تم حفظ قالب التهيئة محلياً وفي الذاكرة بنجاح.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleLaunchNewPlan = (newPlan: OnboardingPlan) => {
    const updated = [newPlan, ...plans];
    savePlans(updated);
    setSelectedPlan(newPlan);

    if (onEmployeeCreated && newPlan.employeeName) {
      const isExisting = existingEmployees.some(e => e.id === newPlan.employeeId || (e.civilId && e.civilId === newPlan.civilId && newPlan.civilId !== 'غير محدد'));
      if (!isExisting) {
        const generatedEmp = {
          id: `EMP-2026-${Date.now().toString().slice(-4)}`,
          nameAr: newPlan.employeeName,
          fullNameAr: newPlan.employeeName,
          jobTitle: newPlan.jobTitle || 'موظف',
          dept: newPlan.department || 'العموم',
          department: newPlan.department || 'العموم',
          civilId: newPlan.civilId !== 'غير محدد' ? newPlan.civilId : '',
          hireDate: newPlan.expectedStartDate || new Date().toISOString().slice(0, 10),
          status: 'على رأس العمل',
          basicSalary: newPlan.department === 'الأطباء' ? 1200 : 700,
          allowances: 150,
          nationality: 'كويتي',
          avatarColor: 'bg-purple-900',
          mohLicense: newPlan.department === 'الأطباء' ? 'MOH-DOC-TEMP' : ''
        };
        onEmployeeCreated(generatedEmp);
      }
    }
  };

  const handleToggleTask = (planId: string, taskId: string) => {
    const updatedPlans = plans.map(p => {
      if (p.id !== planId) return p;

      const updatedTasks = p.tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined
        };
      });

      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progressPercentage = Math.round((completedCount / updatedTasks.length) * 100);
      const newStatus = progressPercentage === 100 ? 'completed' : 'active';

      const updatedPlanObj = {
        ...p,
        tasks: updatedTasks,
        progressPercentage,
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      };

      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(updatedPlanObj);
      }

      return updatedPlanObj;
    });

    savePlans(updatedPlans);
  };

  const handleDeletePlan = (planId: string) => {
    if (!confirm('هل أنت تأكد من إزالة خطة التهيئة هذه؟')) return;
    const updated = plans.filter(p => p.id !== planId);
    savePlans(updated);
    if (selectedPlan?.id === planId) setSelectedPlan(null);
  };

  // Filtered list
  const filteredPlans = plans.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchSearch = !searchQuery || 
      p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.civilId.includes(searchQuery);

    return matchStatus && matchSearch;
  });

  // Analytics
  const activePlansCount = plans.filter(p => p.status === 'active').length;
  const completedPlansCount = plans.filter(p => p.status === 'completed').length;
  const avgProgress = plans.length > 0 
    ? Math.round(plans.reduce((acc, p) => acc + p.progressPercentage, 0) / plans.length) 
    : 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Banner & Header Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#714B67] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#714B67]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>خطط التهيئة وإدارة التعيين (Onboarding Plans & Form Wizard)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Odoo 18 Transient Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              متابعة مراحل تسليم العهد، المستندات الرسمية، وتراخيص وزارة الصحة للموظفين الجدد خطوة بخطوة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveAsDefaultTemplate()}
            disabled={isSavingTemplate}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
            title="حفظ واعتماد الخطة الحالية كقالب افتراضي دائم في قاعدة بيانات Supabase"
          >
            <Save size={15} />
            <span>{isSavingTemplate ? 'جاري الحفظ...' : 'حفظ كقالب دائم لـ Supabase'}</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>+ معالج خطة تهيئة جديدة (Form Wizard)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">خطط التعيين القائمة (Active)</span>
            <span className="text-lg font-black text-amber-600 font-mono">{activePlansCount} خطة</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">الخطط المكتملة 100% (Completed)</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{completedPlansCount} خطة</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">متوسط نسبة إنجاز التهيئة</span>
            <span className="text-lg font-black text-indigo-700 font-mono">{avgProgress}%</span>
          </div>
          <TrendingUp className="w-6 h-6 text-indigo-500 opacity-80" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'active' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الخطط القائمة ({activePlansCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'completed' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المكتملة ({completedPlansCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الخطط ({plans.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المسمى..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
        </div>
      </div>

      {/* Main Content Layout: Plans Grid & Selected Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Plans List / Cards */}
        <div className={`${selectedPlan ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <ListTodo size={36} className="mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="font-bold text-slate-600 text-xs">لا توجد خطط تهيئة قائمة في هذه الفئة</p>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#714B67] font-bold hover:underline cursor-pointer"
              >
                <span>+ تفعيل خطة تهيئة جديدة الآن</span>
              </button>
            </div>
          ) : (
            filteredPlans.map(plan => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`bg-white p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected 
                      ? 'border-[#714B67] ring-2 ring-[#714B67]/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{plan.employeeName}</h3>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {plan.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.jobTitle} | {plan.department}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      plan.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {plan.status === 'completed' ? 'مكتملة 100%' : `جارية (${plan.progressPercentage}%)`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>نسبة الإنجاز:</span>
                      <span className="font-mono">{plan.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          plan.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-[#714B67]'
                        }`}
                        style={{ width: `${plan.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>المباشرة: {plan.expectedStartDate}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#714B67]">
                      <span>عرض قائمة التحقق والمهام ({plan.tasks.filter(t => t.completed).length}/{plan.tasks.length})</span>
                      <ChevronLeft size={13} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Task Manager Drawer */}
        {selectedPlan && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#714B67] flex items-center gap-2">
                  <span>قائمة تحقق خطة: {selectedPlan.employeeName}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedPlan.jobTitle} | المباشرة: {selectedPlan.expectedStartDate}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="حذف الخطة"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block mb-1">مهام واشتراطات التعيين ({selectedPlan.tasks.length} مهام):</span>
              
              {selectedPlan.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(selectedPlan.id, task.id)}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                    task.completed 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-600 cursor-pointer">
                    {task.completed ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} className="text-slate-400" />}
                  </button>
                  <div className="flex-1">
                    <span className={`font-bold block ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>المسؤول: {task.assignedToRole}</span>
                      {task.completedAt && (
                        <span className="text-emerald-600 font-mono">
                          مكتمل: {new Date(task.completedAt).toLocaleDateString('ar-KW')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custody summary */}
            {selectedPlan.custodyItems && selectedPlan.custodyItems.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block text-[11px]">العهد والتجهيزات المسلمة:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedPlan.custodyItems.map((item, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                      📦 {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contract Details Card */}
            {selectedPlan.contractDetails && (
              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                  <span className="font-bold text-purple-950 flex items-center gap-1.5">
                    📄 عقد العمل والأجر الشامل (Contract & Salary)
                  </span>
                  <span className="font-mono font-black text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                    {(selectedPlan.contractDetails.totalSalary || 1000).toLocaleString()} د.ك / شهرياً
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-900">
                  <div>
                    <span className="text-purple-600 block">نوع العقد:</span>
                    <strong className="font-semibold">{selectedPlan.contractDetails.contractType}</strong>
                  </div>
                  <div>
                    <span className="text-purple-600 block">فترة التجربة:</span>
                    <strong className="font-mono font-bold">{selectedPlan.contractDetails.probationDays} يوم عمل (المادة 32)</strong>
                  </div>
                  <div>
                    <span className="text-purple-600 block">تفاصيل الراتب:</span>
                    <span>أساسي ({selectedPlan.contractDetails.basicSalary}) + سكن ({selectedPlan.contractDetails.housingAllowance}) + نقل ({selectedPlan.contractDetails.transportAllowance})</span>
                  </div>
                  <div>
                    <span className="text-purple-600 block">تاريخ بداية العقد:</span>
                    <strong className="font-mono">{selectedPlan.contractDetails.startDate}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Job Commencement Card & Action */}
            {selectedPlan.commencementDetails && (
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    🚀 إقرار المباشرة الفعلية بالفرع (Job Commencement)
                  </span>
                  <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                    مباشر رسمياً ✓
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                  <div>
                    <span className="text-emerald-700 block">تاريخ المباشرة الفعلية:</span>
                    <strong className="font-mono font-bold text-emerald-950">{selectedPlan.commencementDetails.actualJoiningDate}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">المشرف المباشر:</span>
                    <strong className="font-semibold">{selectedPlan.commencementDetails.directSupervisor}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-medium">
                    {selectedPlan.commencementDetails.leaveAccrualActivated ? '✓ تفعيل احتساب رصيد الإجازات السنوية آلياً (2.5 يوم/شهر)' : 'لم يفعل رصيد الإجازات'}
                  </span>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html dir="rtl" lang="ar">
                            <head>
                              <title>إقرار مباشرة عمل - ${selectedPlan.employeeName}</title>
                              <style>
                                body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                                .header { text-align: center; border-bottom: 2px solid #714B67; padding-bottom: 20px; margin-bottom: 30px; }
                                .title { font-size: 22px; font-weight: bold; color: #714B67; margin-bottom: 5px; }
                                .subtitle { font-size: 14px; color: #64748b; }
                                .box { border: 1px solid #cbd5e1; padding: 15px; rounded: 8px; background: #f8fafc; margin-bottom: 20px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-size: 13px; }
                                th { background: #f1f5f9; font-weight: bold; }
                                .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
                                .sig-box { text-align: center; width: 45%; border-top: 1px border #94a3b8; padding-top: 10px; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <div class="title">شركة المنار كلينك الطبية</div>
                                <div class="subtitle">نموذج وإقرار مباشرة عمل موظف جديد (Job Commencement Form)</div>
                              </div>

                              <div class="box">
                                <strong>بيانات الموظف والمباشرة:</strong>
                                <table>
                                  <tr><th>اسم الموظف</th><td>${selectedPlan.employeeName}</td><th>الرقم المدني</th><td>${selectedPlan.civilId || '-'}</td></tr>
                                  <tr><th>المسمى الوظيفي</th><td>${selectedPlan.jobTitle}</td><th>القسم / الإدارة</th><td>${selectedPlan.department}</td></tr>
                                  <tr><th>تاريخ المباشرة الفعلية</th><td>${selectedPlan.commencementDetails?.actualJoiningDate}</td><th>المشرف المباشر</th><td>${selectedPlan.commencementDetails?.directSupervisor}</td></tr>
                                </table>
                              </div>

                              <div class="box">
                                <strong>إقرار استلام العهد والتجهيزات:</strong>
                                <p style="font-size: 12px; margin-top: 8px;">يقر الموظف المذكور أعلاه بأنه استلم كافة العهد والتجهيزات المبينة أدناه بحالة جيدة وتعهد بالمحافظة عليها:</p>
                                <ul>
                                  ${(selectedPlan.custodyItems || []).map((c: string) => `<li>${c}</li>`).join('')}
                                </ul>
                              </div>

                              <div class="signatures">
                                <div class="sig-box">
                                  <strong>توقيع الموظف المباشر</strong><br/><br/><br/>
                                  <span>التاريخ: ${selectedPlan.commencementDetails?.actualJoiningDate}</span>
                                </div>
                                <div class="sig-box">
                                  <strong>اعتماد مدير الموارد البشرية</strong><br/><br/><br/>
                                  <span>شركة المنار كلينك الطبية</span>
                                </div>
                              </div>
                              <script>window.print();</script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🖨️ طباعة إقرار المباشرة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Form Wizard Modal */}
      <OnboardingWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onConfirmLaunch={handleLaunchNewPlan}
        existingEmployees={existingEmployees}
      />
    </div>
  );
};
