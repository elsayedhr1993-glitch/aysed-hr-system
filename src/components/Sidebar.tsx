import React from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Clock, 
  Settings, 
  ShieldAlert, 
  ShieldCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Bug,
  Package,
  Plane,
  FolderKanban,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { isDebugMode, toggleDebugMode, logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'employees', label: 'الموظفون', icon: Users },
    { id: 'leaves', label: 'الإجازات والأرصدة', icon: Calendar },
    { id: 'leave_settlement', label: 'تسوية مستحقات الإجازة', icon: Plane },
    { id: 'holidays', label: 'العطلات والبدلات الرسمية', icon: Sparkles },
    { id: 'company_docs', label: 'مستندات المؤسسة', icon: FolderKanban },
    { id: 'payroll', label: 'الرواتب و WPS Kuwait', icon: CreditCard },
    { id: 'attendance', label: 'البصمة والحضور', icon: Clock },
    { id: 'operations', label: 'العهد والعمليات والجزاءات', icon: Package },
    { id: 'security_guards', label: 'الأمن والورديات', icon: ShieldCheck },
    { id: 'templates', label: 'القوالب والمستندات', icon: FileText },
    { id: 'settings', label: 'الإعدادات العامة (Core)', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#714B67] text-white flex flex-col h-screen fixed right-0 top-0 select-none shadow-xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg tracking-wide">Aysed HR Kuwait</h1>
          <p className="text-xs text-white/60">Odoo Enterprise Edition</p>
        </div>
        <button 
          onClick={toggleDebugMode}
          title={isDebugMode ? "إيقاف وضع المطور" : "تفعيل وضع المطور"}
          className={`p-1.5 rounded transition ${isDebugMode ? 'bg-amber-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
        >
          <Bug size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-white text-[#714B67] shadow-sm font-bold' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Developer Tab (Only visible in debug mode) */}
        {isDebugMode && (
          <button
            onClick={() => setCurrentTab('developer')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold border border-amber-400/50 mt-4 ${
              currentTab === 'developer'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
            }`}
          >
            <ShieldAlert size={18} />
            <span>أدوات المطورين والتهيئة</span>
          </button>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-xs font-bold truncate max-w-[130px]">{user?.name || 'مدير النظام'}</p>
            <p className="text-[10px] text-white/60">{user?.email || 'admin@almanarclinic.com'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-rose-500/20 text-rose-300 rounded transition" 
            title="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
