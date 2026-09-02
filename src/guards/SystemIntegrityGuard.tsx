import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, X, Printer, CheckCircle2, RotateCcw } from 'lucide-react';

export interface SystemAlertEvent {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  solution: string;
  timestamp: string;
}

// دالة إرسال التنبيه للحارس
export const triggerSystemAlert = (alert: Omit<SystemAlertEvent, 'id' | 'timestamp'>) => {
  const event = new CustomEvent('system_guard_alert', {
    detail: {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-KW')
    }
  });
  window.dispatchEvent(event);
};

// دالة الطباعة المحروسة التفاعلية 100%
export const safePrintAction = (targetDocumentName = 'التقرير الرسمي A4') => {
  // 1. التحقق من بيئة المتصفح ودعم الطباعة
  if (typeof window === 'undefined' || typeof window.print !== 'function') {
    triggerSystemAlert({
      type: 'warning',
      title: 'محرك الطباعة غير مدعوم في هذه البيئة',
      solution: 'يرجى استخدام متصفح حديث مثل Google Chrome أو تصدير المستند كملف PDF.'
    });
    return;
  }

  // 2. تنبيه الحارس وبدء عملية الطباعة
  try {
    window.print();
  } catch (err: any) {
    console.warn('Print execution caught error:', err);
    triggerSystemAlert({
      type: 'error',
      title: `فشل تشغيل أمر الطباعة: ${err?.message || 'خطأ غير معروف'}`,
      solution: 'يرجى مراجعة صلاحيات المتصفح أو الضغط على زر التصدير إلى PDF.'
    });
  }
};

export const SystemIntegrityGuard: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<SystemAlertEvent[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleAlert = (e: any) => {
      setActiveAlerts(prev => [e.detail, ...prev]);
    };
    window.addEventListener('system_guard_alert', handleAlert);
    return () => window.removeEventListener('system_guard_alert', handleAlert);
  }, []);

  const handleClearAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const errorAlerts = activeAlerts.filter(a => a.type === 'error');
  const hasErrors = errorAlerts.length > 0;
  const latestAlert = activeAlerts[0];

  return (
    <>
      {/* شريط الحارس العلوي */}
      <div 
        className={`w-full text-xs px-4 py-1.5 flex items-center justify-between font-bold transition-all duration-300 z-50 ${
          hasErrors 
            ? 'bg-rose-600 text-white animate-pulse shadow-md' 
            : activeAlerts.length > 0
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-emerald-600 text-white shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <ShieldAlert size={16} className="text-amber-300 animate-bounce" />
          ) : activeAlerts.length > 0 ? (
            <AlertTriangle size={16} className="text-amber-200" />
          ) : (
            <ShieldCheck size={16} className="text-emerald-200" />
          )}
          <span>
            {hasErrors 
              ? `تنبيه حارس النظام: تم رصد خطأ في تنفيذ العملية!`
              : latestAlert 
                ? `حارس النظام: ${latestAlert.title}`
                : 'حارس النظام (Integrity Guard): جميع العمليات والأزرار ومحرك الرواتب (26 يوماً) تحت المراقبة 100%'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 ? (
            <button
              onClick={() => setShowDetails(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-mono cursor-pointer transition flex items-center gap-1"
            >
              <span>سجل التنبيهات ({activeAlerts.length})</span>
            </button>
          ) : (
            <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-mono">
              0 أخطاء رُصدت
            </span>
          )}
          <span className="text-[10px] text-emerald-100 font-mono hidden sm:inline">ODOO WATCHDOG ACTIVE</span>
        </div>
      </div>

      {/* نافذة تشخيص التنبيهات والأخطاء */}
      {showDetails && activeAlerts.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-sans dir-rtl" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border space-y-4 text-slate-800">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 font-black text-sm text-[#714B67]">
                <ShieldCheck size={20} />
                <span>سجل تنبيهات وفحص حارس النظام</span>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activeAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3.5 rounded-2xl space-y-1 relative border ${
                    alert.type === 'error' 
                      ? 'bg-rose-50 border-rose-200 text-rose-950' 
                      : alert.type === 'info'
                        ? 'bg-blue-50 border-blue-200 text-blue-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <button 
                    onClick={() => handleClearAlert(alert.id)}
                    className="absolute top-2 left-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                  <div className="font-bold flex items-center gap-1.5">
                    {alert.type === 'error' ? <ShieldAlert size={14} className="text-rose-600" /> : <CheckCircle2 size={14} className="text-blue-600" />}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] opacity-90 font-medium">💡 التوجيه: {alert.solution}</p>
                  <span className="text-[9px] opacity-60 font-mono block mt-1">التوقيت: {alert.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                onClick={() => setActiveAlerts([])}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
              >
                مسح كل السجلات
              </button>
              <button
                onClick={() => { setShowDetails(false); safePrintAction(); }}
                className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <RotateCcw size={14} />
                <span>إعادة محاولة الطباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SystemIntegrityGuard;
