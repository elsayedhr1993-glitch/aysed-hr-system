import React, { useState, useRef, useEffect } from 'react';
import { Bug, Settings, Copy, Trash2, ShieldOff, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OdooDevMenuProps {
  isDevMode: boolean;
  onToggleDevMode: () => void;
}

export const OdooDevMenu: React.FC<OdooDevMenuProps> = ({ isDevMode, onToggleDevMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearCache = () => {
    // Keep auth session but clear cache
    Object.keys(localStorage).forEach(key => {
      if (!key.includes('auth') && !key.includes('user') && key !== 'activeCompanyId') {
        localStorage.removeItem(key);
      }
    });
    toast.success('تم مسح الكاش بنجاح مع الحفاظ على الجلسة');
    setIsOpen(false);
  };

  const handleCopyReport = () => {
    const report = {
      system: 'Aysed S HR 2026 - Kuwait',
      engine: 'Odoo Enterprise Engine v18.0e',
      debugMode: true,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success('تم نسخ التقرير الفني');
    setIsOpen(false);
  };

  const handleInspectModel = () => {
    toast('⚙️ Odoo Model Inspector Activated', { icon: '🔍' });
    setIsOpen(false);
  };

  if (!isDevMode) {
    return (
      <button
        onClick={onToggleDevMode}
        className="px-2 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer text-slate-300 hover:text-white hover:bg-white/10"
        title="تفعيل وضع المطور (Activate Developer Mode)"
      >
        <Bug size={14} className="opacity-50" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition cursor-pointer"
        title="وضع المطور مُفعل (Developer Mode Active)"
      >
        <Bug size={16} className="animate-pulse" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-slate-800 font-sans">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bug size={14} className="text-orange-500" />
              <span>Odoo Developer Tools</span>
            </div>
          </div>
          
          <button onClick={handleInspectModel} className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer">
            <Settings size={14} className="text-slate-500" />
            <span>فحص النموذج (View Metadata)</span>
          </button>
          
          <button onClick={handleClearCache} className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer">
            <Trash2 size={14} className="text-slate-500" />
            <span>مسح الكاش (Clear Cache)</span>
          </button>
          
          <button onClick={handleCopyReport} className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer">
            <Copy size={14} className="text-slate-500" />
            <span>نسخ التقرير الفني (State)</span>
          </button>
          
          <div className="h-px bg-slate-100 my-1"></div>
          
          <button 
            onClick={() => {
              onToggleDevMode();
              setIsOpen(false);
            }} 
            className="w-full text-right px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldOff size={14} />
            <span>إيقاف وضع المطور (Deactivate)</span>
          </button>
        </div>
      )}
    </div>
  );
};
