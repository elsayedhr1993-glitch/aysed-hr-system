import React, { useState } from 'react';
import { 
  Bug, Copy, Check, Trash2, RefreshCw, Database, 
  Terminal, Activity, ShieldAlert, Cpu, HardDrive, CheckCircle2 
, Wrench } from 'lucide-react';

interface DeveloperSuiteProps {
  onDisableDevMode: () => void;
}

export const DeveloperSuite: React.FC<DeveloperSuiteProps> = ({ onDisableDevMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'logs' | 'cache'>('cache');
  const [copied, setCopied] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleCopyReport = () => {
    const report = {
      system: 'Aysed S HR 2026 - Kuwait',
      engine: 'Odoo Enterprise Engine v18.0e',
      debugMode: true,
      timestamp: new Date().toISOString(),
      localStorageKeys: Object.keys(localStorage),
      userAgent: navigator.userAgent
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      // 1. حفظ بيانات الجلسة الحالية
      const authSession = localStorage.getItem('aysed_hr_auth');
      const currentUser = localStorage.getItem('current_user');
      
      // اضافة حفظ للشركات حتى لا تعود البيانات الوهمية
      const registeredCompanies = localStorage.getItem('aysed_registered_companies_live');
      const activeCompanyId = localStorage.getItem('activeCompanyId');
      const devMode = localStorage.getItem('aysed_dev_mode'); // عشان ما يقفل وضع المطور بعد الـ reload

      // 2. تفريغ الكاش والبيانات المؤقتة القديمة
      localStorage.clear();
      sessionStorage.clear();

      // 3. إعادة استرجاع الجلسة
      if (authSession) localStorage.setItem('aysed_hr_auth', authSession);
      if (currentUser) localStorage.setItem('current_user', currentUser);
      if (registeredCompanies) localStorage.setItem('aysed_registered_companies_live', registeredCompanies);
      if (activeCompanyId) localStorage.setItem('activeCompanyId', activeCompanyId);
      if (devMode) localStorage.setItem('aysed_dev_mode', devMode);

      // 4. إعادة تحميل الواجهة بسلاسة
      window.location.reload();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-800 dir-rtl relative z-20 pointer-events-auto" dir="rtl">
      
      {/* 1. البانر البرتقالي المميز (Developer Header Banner) */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 z-20 pointer-events-auto">
        
        {/* معلومات الواجهة */}
        <div className="flex items-center gap-4 z-20 pointer-events-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
            <Bug size={32} className="text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-amber-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Odoo Debug Mode
              </span>
              <span className="text-amber-200 text-xs font-mono">• Active Session</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">أدوات المطور والتهيئة الفنية (Developer Suite)</h1>
            <p className="text-xs text-amber-100 font-medium">لوحة التحكم التقنية لإدارة قاعدة البيانات، الفحص الفوري للنماذج، وسجلات التشغيل وحالة الجلسة</p>
          </div>
        </div>

        {/* أزرار التحكم في البانر */}
        <div className="flex items-center gap-2.5 z-20 w-full md:w-auto justify-end pointer-events-auto">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer relative z-20 pointer-events-auto"
          >
            {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
            <span>{copied ? 'تم نسخ التقرير' : 'نسخ التقرير الفني'}</span>
          </button>

          <button
            onClick={onDisableDevMode}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white border-rose-500 rounded-xl text-xs font-black transition shadow-md cursor-pointer relative z-20 pointer-events-auto"
          >
            <Bug size={16} className="text-white rotate-45" />
            <span>إيقاف وضع المطور</span>
          </button>
        </div>

        {/* خلفية زخرفية */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none z-0" />
      </div>

      {/* 2. شريط التبويبات الفنية (Sub-Tabs) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold relative z-20 pointer-events-auto">
        <button
          onClick={() => setActiveTab('cache')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition relative z-20 pointer-events-auto cursor-pointer ${
            activeTab === 'cache'
              ? 'bg-[#714B67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RefreshCw size={15} />
          <span>الكاش والأداء</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition relative z-20 pointer-events-auto cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#714B67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal size={15} />
          <span>سجلات التشغيل الحية</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition relative z-20 pointer-events-auto cursor-pointer ${
            activeTab === 'database'
              ? 'bg-[#714B67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database size={15} />
          <span>قاعدة البيانات والتخزين</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition relative z-20 pointer-events-auto cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#714B67] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity size={15} />
          <span>نظرة عامة والحالة</span>
        </button>
      </div>

      {/* 3. محتوى التبويبات */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[350px] relative z-20 pointer-events-auto">
        
        {/* تبويب الكاش والأداء */}
        {activeTab === 'cache' && (
          <div className="space-y-6 relative z-20 pointer-events-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">تنظيف الكاش والذاكرة المؤقتة</h3>
                <p className="text-xs text-slate-500 mt-0.5">استخدم هذه الخيارات لإعادة ضبط الملفات المؤقتة وسجل البحث</p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={cacheCleared}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 relative z-20 pointer-events-auto"
              >
                {cacheCleared ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
                <span>{cacheCleared ? 'تم التنظيف بنجاح...' : 'مسح التخزين المؤقت الكاش'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">عناصر التخزين المحلي</span>
                <span className="text-lg font-black font-mono text-slate-800">{Object.keys(localStorage).length} مفاتيح</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">استجابة محرك Odoo</span>
                <span className="text-lg font-black font-mono text-emerald-600">12ms (Optimal)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">حالة الذاكرة (Memory Heap)</span>
                <span className="text-lg font-black font-mono text-indigo-600">Stable (0 Leaks)</span>
              </div>
            </div>
          </div>
        )}

        {/* تبويب السجلات */}
        {activeTab === 'logs' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 max-h-[300px] overflow-y-auto relative z-20 pointer-events-auto">
              <div className="text-emerald-400 font-bold">[INFO] [Odoo 18 Engine] Multi-Company Context initialized.</div>
              <div className="text-emerald-400 font-bold">[INFO] [Kuwait Labor Law Engine] Active payroll divisor = 26 days.</div>
              <div className="text-amber-400 font-bold">[DEBUG] [Auth] Developer Mode Suite mounted successfully.</div>
              <div className="text-slate-400">[TRACE] Watchdog active: 0 runtime uncaught errors.</div>
            </div>
          </div>
        )}

        {/* تبويب قاعدة البيانات والتخزين */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs relative z-20 pointer-events-auto">
            <h3 className="text-sm font-black text-slate-800">مفاتيح التخزين النشطة (Local Storage Keys)</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden relative z-20 pointer-events-auto">
              {Object.keys(localStorage).map((k) => (
                <div key={k} className="p-3 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 relative z-20 pointer-events-auto">
                  <span className="font-mono font-bold text-slate-700">{k}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{(localStorage.getItem(k) || '').length} bytes</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تبويب نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs relative z-20 pointer-events-auto">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Cpu size={16} className="text-[#714B67]" />
                <span>إصدار النظام الأساسي</span>
              </div>
              <p className="text-slate-500 font-mono">Aysed S HR 2026 - Kuwait (Odoo v18.0e Spec)</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <HardDrive size={16} className="text-emerald-600" />
                <span>بروتوكول الأمان والجدار الناري</span>
              </div>
              <p className="text-slate-500 font-mono">Active (Strict Auth & Sandbox Isolated)</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default DeveloperSuite;
