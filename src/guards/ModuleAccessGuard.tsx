import React from 'react';
import { ShieldOff } from 'lucide-react';

interface GuardProps {
  userRole: 'admin' | 'hr_manager' | 'viewer';
  allowedRoles: ('admin' | 'hr_manager' | 'viewer')[];
  children: React.ReactNode;
}

export const ModuleAccessGuard: React.FC<GuardProps> = ({ userRole, allowedRoles, children }) => {
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldOff size={32} />
        </div>
        <h3 className="text-base font-black text-slate-900">حارس الصلاحيات: الوصول مقيد</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          عفواً، لا تملك الصلاحية الكافية للوصول إلى هذا القسم. يرجى التواصل مع مدير النظام (Administrator).
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
