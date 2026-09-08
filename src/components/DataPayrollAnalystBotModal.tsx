import React, { useState, useEffect } from 'react';
import { 
  X, BarChart3, TrendingUp, PieChart, Users, DollarSign, BrainCircuit, Sparkles, Download, ArrowUpRight, ArrowDownRight, AlertTriangle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { Employee } from '../types';

interface DataPayrollAnalystBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: Employee[];
}

export const DataPayrollAnalystBotModal: React.FC<DataPayrollAnalystBotModalProps> = ({ 
  isOpen, 
  onClose,
  employees = []
}) => {
  const [activeTab, setActiveTab] = useState<'COST_CENTERS' | 'TURNOVER' | 'BUDGET'>('COST_CENTERS');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Mock Data generation based on real arrays if available, but simulated for AI feeling
  const totalEmployees = employees.length || 45;
  const avgSalary = 650;
  
  const costCenterData = [
    { name: 'الإدارة', payroll: 12500, count: 5 },
    { name: 'الموارد البشرية', payroll: 4200, count: 3 },
    { name: 'الهندسة والتقنية', payroll: 18500, count: 12 },
    { name: 'المبيعات', payroll: 9800, count: 10 },
    { name: 'العمليات', payroll: 14200, count: 15 },
  ];

  const turnoverData = [
    { month: 'يناير', rate: 1.2 },
    { month: 'فبراير', rate: 0.8 },
    { month: 'مارس', rate: 1.5 },
    { month: 'أبريل', rate: 2.1 },
    { month: 'مايو', rate: 1.0 },
    { month: 'يونيو', rate: 0.5 },
  ];

  const COLORS = ['#714B67', '#D49A89', '#53354c', '#F4D35E', '#2A9D8F'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 dir-rtl" dir="rtl">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center shadow-lg">
              <BrainCircuit size={26} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">محلل البيانات واستراتيجي الرواتب</h2>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm border border-emerald-400 flex items-center gap-1">
                  <Sparkles size={10} />
                  AI Data Analyst
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                تخطيط مالي، دعم اتخاذ القرار، تحليلات مراكز التكلفة، وتوقع وتيرة الاستقالات.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition cursor-pointer relative z-10">
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white">
            <div className="relative mb-6">
              <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-emerald-600 rounded-full absolute top-0 left-0 border-t-transparent animate-spin"></div>
              <BarChart3 size={32} className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="font-black text-slate-800 text-xl">جاري معالجة البيانات وبناء النماذج التحليلية...</h3>
            <p className="text-sm font-bold text-slate-500 mt-2">يقوم الذكاء الاصطناعي الآن بربط مسيرات الرواتب بمراكز التكلفة والتنبؤ بالميزانية</p>
          </div>
        ) : (
          <>
            {/* Tabs & Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('COST_CENTERS')}
                  className={`px-4 py-2 rounded-lg transition cursor-pointer text-xs font-bold flex items-center gap-2 ${activeTab === 'COST_CENTERS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <BarChart3 size={16} />
                  <span>مراكز التكلفة والرواتب</span>
                </button>
                <button
                  onClick={() => setActiveTab('TURNOVER')}
                  className={`px-4 py-2 rounded-lg transition cursor-pointer text-xs font-bold flex items-center gap-2 ${activeTab === 'TURNOVER' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <TrendingUp size={16} />
                  <span>معدل الدوران والتنبؤ</span>
                </button>
                <button
                  onClick={() => setActiveTab('BUDGET')}
                  className={`px-4 py-2 rounded-lg transition cursor-pointer text-xs font-bold flex items-center gap-2 ${activeTab === 'BUDGET' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <PieChart size={16} />
                  <span>هيكلة الميزانيات</span>
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">
                <Download size={14} />
                <span>تصدير التقرير التحليلي</span>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
              
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">إجمالي الرواتب الشهرية</span>
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{costCenterData.reduce((a, b) => a + b.payroll, 0).toLocaleString()} <span className="text-sm font-bold text-slate-400">د.ك</span></div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <ArrowDownRight size={12} />
                    <span>انخفاض 2.1% عن الشهر السابق</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">متوسط راتب الموظف</span>
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{Math.round(costCenterData.reduce((a, b) => a + b.payroll, 0) / costCenterData.reduce((a,b) => a + b.count, 0)).toLocaleString()} <span className="text-sm font-bold text-slate-400">د.ك</span></div>
                  <div className="mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md">
                    مستقر هذا الربع
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">معدل الاستقالات المتوقع</span>
                    <TrendingUp size={18} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">1.8%</div>
                  <div className="mt-2 text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 w-fit px-2 py-1 rounded-md">
                    <ArrowUpRight size={12} />
                    <span>مخاطر استقالة في قسم المبيعات</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold">كفاءة التكلفة (AI Score)</span>
                    <Sparkles size={18} className="text-[#714B67]" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">89/100</div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    توزيع ممتاز للموارد البشرية
                  </div>
                </div>
              </div>

              {/* Main Chart Area depending on active tab */}
              {activeTab === 'COST_CENTERS' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-6">توزيع الرواتب على مراكز التكلفة (الأقسام)</h3>
                    <div className="h-[300px] w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costCenterData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} />
                          <Tooltip 
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="payroll" fill="#059669" radius={[6, 6, 0, 0]} barSize={40} name="الرواتب (د.ك)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                    <h3 className="text-sm font-black text-slate-900 mb-4">توزيع الموظفين</h3>
                    <div className="flex-1 min-h-[250px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={costCenterData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {costCenterData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {costCenterData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="font-bold text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-slate-500 font-bold">{item.count} موظف</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TURNOVER' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-in fade-in duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">تحليل وتوقع الاستقالات (Turnover Predictive AI)</h3>
                      <p className="text-xs text-slate-500 mt-1">توقع استقالات الموظفين بناءً على الرواتب، الإجازات، والغياب</p>
                    </div>
                    <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      <span>خطر مرتفع في الربع القادم</span>
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={turnoverData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                        <Tooltip 
                          cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="rate" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" name="معدل الدوران %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <BrainCircuit size={16} className="text-[#714B67]" />
                        <span>رؤية الذكاء الاصطناعي</span>
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600">
                        هناك احتمالية 65% لزيادة معدل الاستقالات في قسم "المبيعات" بسبب ثبات الرواتب مقارنة بالسوق المحلي خلال آخر 18 شهراً. 
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-600" />
                        <span>التوصيات المقترحة</span>
                      </h4>
                      <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                        <li>إعادة تقييم هيكل عمولات المبيعات.</li>
                        <li>إجراء مقابلات احتفاظ (Stay Interviews) مع الموظفين الرئيسيين.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'BUDGET' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-in fade-in duration-500 min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <PieChart size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">هيكلة الميزانيات الذكية</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-2">
                    يقوم الوكيل الذكي حالياً بجمع بيانات الرواتب للسنة المالية الحالية لإنشاء مقترحات تلقائية لتوزيع الميزانيات وبناء الهيكل التنظيمي المستقبلي.
                  </p>
                  <button className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md">
                    تشغيل المحاكاة المالية المتقدمة
                  </button>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};
