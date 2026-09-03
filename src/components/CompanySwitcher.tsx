import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Check, 
  ChevronDown, 
  Building,
  ShieldAlert,
  LogOut,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { toast } from 'react-hot-toast';

export const CompanySwitcher: React.FC<{ onOpenSaasPortal?: () => void }> = ({ onOpenSaasPortal }) => {
  const { activeCompany, isImpersonating, exitImpersonation } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExitImpersonation = () => {
    exitImpersonation();
    setIsOpen(false);
    toast.success('تم إنهاء وضع المحاكاة والعودة إلى البيئة المركزية للسوبر أدمن');
    if (onOpenSaasPortal) {
      onOpenSaasPortal();
    }
  };

  return (
    <div className="relative font-sans dir-rtl" ref={dropdownRef} dir="rtl">
      {/* Trigger Button - Odoo 18 Slim Style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 flex items-center gap-1.5 px-2 py-0.5 rounded border transition shadow-2xs text-xs font-medium select-none cursor-pointer ${
          isImpersonating 
            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-300 font-bold' 
            : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
        }`}
        title={isImpersonating ? "وضع المحاكاة كمسؤول على الشركة المشتركة" : "المنشأة النشطة"}
      >
        <div className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
          isImpersonating ? 'bg-slate-950 text-amber-300' : 'bg-white/20 text-white'
        }`}>
          {isImpersonating ? '⚠️' : (activeCompany?.nameAr || activeCompany?.name || 'المنشأة').charAt(0)}
        </div>
        <span className="text-right max-w-[140px] truncate text-[11px] font-bold leading-none">
          {activeCompany?.nameAr || activeCompany?.name || 'المنشأة'}
        </span>
        <ChevronDown size={12} className={`transition-transform ${isImpersonating ? 'text-slate-950' : 'text-white/70'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Strict SaaS Isolation */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150 text-slate-800 text-right">
          
          {/* Header */}
          <div className={`p-3 border-b flex items-center justify-between ${
            isImpersonating ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center gap-1.5">
              {isImpersonating ? (
                <ShieldAlert size={15} className="text-amber-700" />
              ) : (
                <ShieldCheck size={15} className="text-[#714B67]" />
              )}
              <span className="text-[11px] font-bold text-slate-800">
                {isImpersonating ? 'وضع المحاكاة كمسؤول (Impersonation)' : 'البيئة النشطة (Master Context)'}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isImpersonating 
                ? 'bg-amber-200 text-amber-900' 
                : 'bg-[#714B67]/15 text-[#714B67]'
            }`}>
              {isImpersonating ? 'جلسة مشتركة' : 'معزولة كلياً'}
            </span>
          </div>

          {/* Active Company Details */}
          <div className="p-3 bg-white space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isImpersonating ? 'bg-amber-600 text-white' : 'bg-[#714B67] text-white'
              }`}>
                <Building size={16} />
              </div>
              <div className="min-w-0 text-right">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeCompany?.nameAr || activeCompany?.name || 'المنشأة'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  سجل تجاري: {activeCompany?.crNumber || activeCompany?.commercialRegNo || '---'}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>ملف التأمينات:</span>
                <span className="font-mono font-bold text-slate-800">{activeCompany?.pifssNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>العملة الافتراضية:</span>
                <span className="font-bold text-slate-800">دينار كويتي (0.000 KWD)</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 space-y-1.5">
            {isImpersonating ? (
              <button
                type="button"
                onClick={handleExitImpersonation}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-amber-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <LogOut size={14} />
                <span>إنهاء المحاكاة والعودة للوحة السوبر أدمن</span>
              </button>
            ) : (
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                🛡️ تطبق المنظومة عزلاً صارماً لقواعد بيانات المشتركين (Strict SaaS Isolation). تصفح المشتركين متاح فقط عبر لوحة المشتركين.
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CompanySwitcher;
