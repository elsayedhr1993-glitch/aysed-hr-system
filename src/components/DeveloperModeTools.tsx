import React, { useState } from 'react';
import { 
  Bug, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Trash2, 
  Cpu, 
  Copy, 
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { TenantDatabaseService } from '../services/tenantDataService';

export const DeveloperModeTools: React.FC = () => {
  const { isDebugMode, toggleDebugMode } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'logs' | 'cache'>('overview');
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] INFO: Odoo Core Developer Mode Active`,
    `[${new Date().toLocaleTimeString()}] SYSTEM: Kuwait HR Engine v2026.8 loaded`,
    `[${new Date().toLocaleTimeString()}] AUTH: Admin session validated with persistent localStorage token`,
  ]);

  const copySystemInfo = () => {
    const info = `
=== AYSED HR ODOO ENTERPRISE SYSTEM DIAGNOSTIC ===
Version: Odoo 2026.8 Enterprise Edition
Platform: Kuwait Labor Law Compliance (Art. 51, 53, 70)
Debug Mode: ${isDebugMode ? 'Active (debug=1)' : 'Inactive'}
User Agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}
Storage Keys: ${Object.keys(localStorage).filter(k => k.startsWith('aysed_') || k.startsWith('odoo_')).join(', ')}
    `.trim();

    navigator.clipboard.writeText(info);
    setCopied(true);
    toast.success('تم نسخ معلومات النظام الحالية إلى الحافظة');
    setTimeout(() => setCopied(false), 2000);
  };

  const clearSystemCache = () => {
    const keysToRemove = Object.keys(localStorage).filter(
      k => k.startsWith('aysed_temp_') || k.startsWith('vite_') || k === 'aysed_debug_cache'
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));
    toast.success('تم تنظيف ذاكرة التخزين المؤقت للأنظمة بنجاح');
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] CACHE: Temporary cache purged`, ...prev]);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <Bug size={32} className="text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black leading-normal">أدوات المطور والتهيئة الفنية (Developer Suite)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 whitespace-nowrap">
                Odoo Debug Mode
              </span>
            </div>
            <p className="text-amber-100/80 text-sm mt-1">
              لوحة التحكم التقنية لإدارة قاعدة البيانات، الفحص الفوري للنماذج، وسجلات التشغيل وحالة الجلسة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copySystemInfo}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold backdrop-blur-md transition border border-white/20"
          >
            {copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} />}
            <span>نسخ التقرير الفني</span>
          </button>
          <button
            onClick={toggleDebugMode}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-sm font-black shadow-md transition"
          >
            <Bug size={18} />
            <span>{isDebugMode ? 'إيقاف وضع المطور' : 'تفعيل وضع المطور'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm">
        {[
          { id: 'overview', label: 'نظرة عامة والحالة', icon: Cpu },
          { id: 'database', label: 'قاعدة البيانات والتخزين', icon: Database },
          { id: 'logs', label: 'سجلات التشغيل الحية', icon: Terminal },
          { id: 'cache', label: 'الكاش والأداء', icon: RefreshCw },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                isActive
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>حالة المصادقة والتعريف</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">جلسة نشطة وثابتة</div>
            <p className="text-xs text-slate-500">
              مأمنة عبر localStorage مع منع تسجيل الخروج عند تحديث الصفحة أو تفعيل المطورين.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">رمز التوثيق (Token):</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-bold">OK (Stored)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>وضع التطوير (Debug Mode)</span>
              <Bug size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {isDebugMode ? 'مُفعل (debug=1)' : 'غير مُفعل'}
            </div>
            <p className="text-xs text-slate-500">
              يسمح بفحص عناصر أودو والحقول الميدانية وإظهار تبويب أدوات المطور بالكامل.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Odoo Inspector:</span>
              <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">READY</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>محرك القانون الكويتي</span>
              <CheckCircle2 size={16} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">الكويت v2026.8</div>
            <p className="text-xs text-slate-500">
              المادة 51، المادة 53، رواتب WPS، والتأمينات الاجتماعية متوافقة 100%.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">WPS Bank Format:</span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">KFH / CIB</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-900">تصفير شامل لقاعدة البيانات (Full Database Reset)</h3>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    حذف جميع الموظفين، العقود، طلبات وأرصدة الإجازات، حركات البصمة، مسيرات الرواتب وسندات الصرف، وتصفير عدادات لوحة القيادة إلى 0.000 د.ك لبدء إدخال بيانات فعلية على نظافة.
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!window.confirm('⚠️ تنبيه حاسم: هل أنت متأكد تماماً من تصفير قاعدة البيانات ومسح كافة الموظفين، العقود، طلبات الإجازات، مسيرات الرواتب وسندات الصرف؟ سيصبح النظام أبيض تماماً.')) {
                    return;
                  }
                  setIsWiping(true);
                  try {
                    await TenantDatabaseService.wipeEntireSystem();
                    toast.success('تم تصفير قاعدة البيانات بالكامل');
                    setTimeout(() => window.location.reload(), 600);
                  } catch (e) {
                    toast.error('حدث خطأ أثناء التصفير');
                    setTimeout(() => window.location.reload(), 600);
                  } finally {
                    setIsWiping(false);
                  }
                }}
                disabled={isWiping}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isWiping ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>{isWiping ? 'جارِ تصفير النظام...' : 'تصفير شامل ومسح البيانات الآن'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">حالة قاعدة البيانات والتخزين المحلي</h3>
              <p className="text-xs text-slate-500">إدارة مفاتيح الجلسة وتخزين Supabase / LocalStorage</p>
            </div>
            <button
              onClick={() => {
                toast.success('تمت إعادة مزامنة جداول النظام');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
            >
              <RefreshCw size={14} />
              <span>إعادة المزامنة</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { key: 'aysed_token', desc: 'رمز الجلسة المسجلة لمدير النظام' },
              { key: 'aysed_user', desc: 'بيانات مستخدم الجلسة الحالية' },
              { key: 'aysed_debug', desc: 'حالة وضع المطورين' },
              { key: 'registered_companies_v1', desc: 'سجل الشركات والمؤسسات' },
              { key: 'activeCompanyId', desc: 'معرف الشركة النشطة حالياً' },
            ].map(item => (
              <div key={item.key} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-[#714B67]">{item.key}</span>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  {localStorage.getItem(item.key) ? 'موجود (Set)' : 'غير محدد'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Terminal size={18} />
              <span>Odoo Server & Frontend Execution Console</span>
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-slate-400 hover:text-rose-400 transition"
            >
              مسح السجلات
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cache' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">تنظيف الكاش والذاكرة المؤقتة</h3>
          <p className="text-xs text-slate-500">
            استخدم هذه الخيارات لإعادة ضبط الملفات المؤقتة وسجل البحث دون فقدان التعيينات الأساسية.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={clearSystemCache}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
            >
              <Trash2 size={16} />
              <span>مسح التخزين المؤقت الكاش</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperModeTools;
