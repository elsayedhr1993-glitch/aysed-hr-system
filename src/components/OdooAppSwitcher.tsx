import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  Clock, 
  Calendar, 
  Briefcase, 
  FolderKanban, 
  BarChart3, 
  Sparkles, 
  FileCode2, 
  Sliders,
  Building2,
  X, 
  Search 
} from 'lucide-react';

interface AppIconProps {
  id: string;
  label: string;
  Icon: React.ElementType;
  colorClass: string;
  onClick: (id: string) => void;
}

const AppIcon: React.FC<AppIconProps> = ({ id, label, Icon, colorClass, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group focus:outline-hidden w-24 sm:w-28"
    >
      <div className={`w-20 h-20 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${colorClass}`}>
        <Icon size={38} className="text-white drop-shadow-xs" />
      </div>
      <span className="text-xs font-medium text-slate-200 mt-2.5 text-center leading-tight group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
};

interface OdooAppSwitcherProps {
  onSelectApp: (appId: string) => void;
  onClose?: () => void;
}

export const OdooAppSwitcher: React.FC<OdooAppSwitcherProps> = ({ onSelectApp, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 11 Odoo Enterprise Apps
  const apps = [
    // الصف الأول
    { id: 'hr', label: 'الموظفون', icon: Users, color: 'bg-[#714B67]' },
    { id: 'timesheets', label: 'الحضور والبصمة', icon: Clock, color: 'bg-blue-800' },
    { id: 'planning', label: 'تخطيط الشفتات', icon: Calendar, color: 'bg-orange-600' },
    { id: 'attendance', label: 'الإجازات والغياب', icon: CalendarDays, color: 'bg-teal-600' },
    { id: 'payroll', label: 'الرواتب و WPS', icon: CreditCard, color: 'bg-emerald-600' },
    // الصف الثاني وما يليه
    { id: 'custody', label: 'العمليات والعهد', icon: Briefcase, color: 'bg-amber-700' },
    { id: 'docs', label: 'أرشيف المستندات', icon: FolderKanban, color: 'bg-amber-600' },
    { id: 'templates', label: 'النماذج والخطابات', icon: FileCode2, color: 'bg-cyan-700' },
    { id: 'holidays', label: 'العطلات الرسمية', icon: Sparkles, color: 'bg-purple-600' },
    { id: 'reports', label: 'لوحة التقارير والقيادة', icon: BarChart3, color: 'bg-indigo-600' },
    { id: 'saas', label: 'لوحة المشتركين SaaS', icon: Building2, color: 'bg-indigo-800' },
    { id: 'settings', label: 'الإعدادات العامة', icon: Sliders, color: 'bg-slate-700' },
  ];

  // Auto-focus on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global keydown listeners for escape and typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (e.key === 'Enter') {
        const filtered = apps.filter(app => 
          app.label.includes(searchQuery) || app.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
          onSelectApp(filtered[0].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSelectApp, searchQuery, apps]);

  const filteredApps = apps.filter(app => 
    app.label.includes(searchQuery) || app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 min-h-screen bg-gradient-to-b from-slate-900 via-[#111827] to-slate-950 flex flex-col justify-center items-center text-white overflow-y-auto px-4 py-8 select-none animate-in fade-in duration-200 relative"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Optional Close Button in Top Corner */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/70 hover:text-white border border-white/10 transition cursor-pointer backdrop-blur-md"
          title="إغلاق المعرض (Esc)"
        >
          <X size={18} />
        </button>
      )}

      {/* 1. Search Input Bar */}
      <div className="w-full max-w-md mx-auto mb-10">
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في التطبيقات والإجراءات..."
            className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md text-center"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Centered Flex Grid for 11 Icons */}
      <div className="flex flex-wrap justify-center items-center gap-8 max-w-5xl mx-auto px-4">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-white/60 w-full">
            <p className="text-base font-semibold">لم يتم العثور على أي تطبيق يطابق "{searchQuery}"</p>
            <p className="text-xs text-white/40 mt-1">يرجى التأكد من كتابة اسم التطبيق بصورة صحيحة</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <AppIcon
              key={app.id}
              id={app.id}
              label={app.label}
              Icon={app.icon}
              colorClass={app.color}
              onClick={onSelectApp}
            />
          ))
        )}
      </div>
    </div>
  );
};

