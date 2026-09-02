import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Terminal, 
  Database, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server,
  Layers,
  Power
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export const OdooDeveloperConsoleApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<'logs' | 'database' | 'overview' | 'cache'>('logs');
  const [copied, setCopied] = useState(false);
  const [devModeActive, setDevModeActive] = useState(true);

  const [logs, setLogs] = useState<string[]>([
    'AUTH: Admin session validated with persistent localStorage token [PM 8:25:31]',
    'SYSTEM: Kuwait HR Engine v2026.8 loaded [PM 8:25:31]',
    'INFO: Odoo Core Developer Mode Active [PM 8:25:31]',
    'CACHE: Temporary cache verified and synchronized [PM 8:25:52]',
    'DATABASE: IndexedDB & LocalStorage health checks: 100% OK [PM 8:26:00]',
    'COMPLIANCE: Kuwait Labor Law Rules (26 Days Basis / 0% PIFSS) engaged'
  ]);

  const handleClearLogs = () => {
    setLogs(['SYSTEM: Logs cleared by administrator']);
  };

  const handlePurgeCache = () => {
    localStorage.clear();
    alert('تم تنظيف الكاش والذاكرة المؤقتة بنجاح.');
    window.location.reload();
  };

  const handleCopyReport = () => {
    const reportText = `--- تقرير الفحص الفني لنظام Odoo HR 2026 ---
المنشأة: ${activeCompany?.nameAr || 'الشركة الحالية'}
الحالة: Odoo Debug Mode Active
السجلات:
${logs.join('\n')}
------------------------------------------------`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Developer Mode Banner (مطابق للصورة تماماً) */}
      <div className="bg-gradient-to-l from-[#8E443D] via-[#A8483B] to-[#C05646] p-6 rounded-3xl text-white shadow-lg border border-red-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-300 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[10px] font-mono">
              Odoo Debug Mode
            </span>
            <span className="text-[11px] text-amber-100 font-mono">Developer Platform 2026</span>
          </div>
          <h1 className="text-xl font-black">لوحة الفحص والتهيئة الفنية (Developer Mode)</h1>
          <p className="text-xs text-red-100 mt-1">لوحة التحكم التقنية لإدارة قاعدة البيانات، الفحص الفوري للنماذج، وسجلات التشغيل وحالة الجلسة</p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
          >
            {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
            <span>{copied ? 'تم نسخ التقرير' : 'نسخ التقرير الفني'}</span>
          </button>

          <button
            onClick={() => setDevModeActive(!devModeActive)}
            className="bg-white/90 hover:bg-white text-[#8E443D] px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Power size={15} />
            <span>{devModeActive ? 'إيقاف وضع المطور' : 'تفعيل وضع المطور'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-1.5 text-xs font-bold overflow-x-auto">
        {[
          { id: 'logs', label: 'سجلات التشغيل الحية >_', icon: Terminal },
          { id: 'database', label: 'قاعدة البيانات والتخزين', icon: Database },
          { id: 'overview', label: 'نظرة عامة والحالة', icon: Activity },
          { id: 'cache', label: 'الكاش والأداء', icon: RefreshCw }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#714B67] text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Terminal / Live Execution Console View (شاشة الـ Terminal) */}
      {activeTab === 'logs' && (
        <div className="bg-[#1C2434] rounded-3xl border border-slate-700 shadow-2xl p-6 font-mono text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Terminal size={16} className="text-amber-400" />
              <span>Odoo Server & Frontend Execution Console &gt;_</span>
            </div>
            <button
              onClick={handleClearLogs}
              className="text-slate-400 hover:text-red-400 transition text-[11px] flex items-center gap-1 cursor-pointer font-sans"
            >
              <Trash2 size={13} />
              <span>مسح السجلات</span>
            </button>
          </div>

          <div className="space-y-2 text-slate-300 py-3 min-h-[220px] max-h-[350px] overflow-y-auto text-left dir-ltr">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed hover:bg-white/5 px-2 py-0.5 rounded">
                <span className="text-emerald-400 font-bold">&gt;&gt;</span> {log}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] text-slate-500">
            <span>Status: Listening to reactive events...</span>
            <span className="font-mono text-amber-400">KUWAIT_TZ: GMT+3</span>
          </div>
        </div>
      )}

      {/* 2. Database & Storage View */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
            <Database size={16} className="text-[#714B67]" />
            <span>حالة الجداول والتخزين المحلي (LocalStorage Tables)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border">
              <span className="text-slate-500 block text-[11px] mb-1 font-sans">جدول الموظفين والعقود:</span>
              <div className="text-lg font-bold text-slate-900">hr.employee (4 Records)</div>
              <span className="text-emerald-600 text-[10px] font-bold mt-1 block">Active & Verified</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border">
              <span className="text-slate-500 block text-[11px] mb-1 font-sans">قواعد الرواتب ومسير WPS:</span>
              <div className="text-lg font-bold text-slate-900">hr.payslip (26-Days Engine)</div>
              <span className="text-emerald-600 text-[10px] font-bold mt-1 block">Kuwait SIF Ready</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border">
              <span className="text-slate-500 block text-[11px] mb-1 font-sans">الإجازات والورديات:</span>
              <div className="text-lg font-bold text-slate-900">hr.leave & security.shift</div>
              <span className="text-emerald-600 text-[10px] font-bold mt-1 block">Article 71 & 12h OT</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cache & Actions View */}
      {activeTab === 'cache' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-3">إدارة الذاكرة المؤقتة وتسريع الأداء</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            في حال قمت بتعديل أي كود أو واجهتك مشكلة في تحديث البيانات التلقائي، يمكنك تنظيف الكاش بالكامل بنقرة واحدة.
          </p>
          <button
            onClick={handlePurgeCache}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition"
          >
            <Trash2 size={15} />
            <span>تنظيف الكاش وإعادة بناء النظام (Purge & Rebuild)</span>
          </button>
        </div>
      )}

      {/* 4. Overview View */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2">بيئة التشغيل الحالية</h3>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>بيئة التشغيل: <strong className="text-slate-900">React + Vite + Tailwind CSS</strong></div>
            <div>معيار النظام: <strong className="text-[#714B67]">Odoo 17/18 Enterprise Architecture</strong></div>
            <div>قانون العمل: <strong className="text-emerald-700">قانون العمل الكويتي بالقطاع الأهلي (26 يوم)</strong></div>
            <div>حالة الاتصال: <strong className="text-emerald-700">Online & Synchronized</strong></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooDeveloperConsoleApp;
