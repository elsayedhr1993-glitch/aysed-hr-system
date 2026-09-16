import React from 'react';
import { ShieldOff } from 'lucide-react';

interface GuardProps {
  userRole?: string;
  allowedRoles?: string[];
  permissions?: string[];
  children: React.ReactNode;
}

const normalizeRoleList = (value?: string[] | null): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map(entry => entry.trim());
};

export const ModuleAccessGuard: React.FC<GuardProps> = ({ userRole, allowedRoles, permissions, children }) => {
  const safeRole = typeof userRole === 'string' ? userRole.trim() : '';
  const safeAllowedRoles = normalizeRoleList(allowedRoles);
  const safePermissions = normalizeRoleList(permissions);
  const hasPermissionAccess = safePermissions.length > 0 ? safePermissions.some(permission => permission === safeRole || safeAllowedRoles.includes(permission)) : true;
  const isAuthorized = safeAllowedRoles.includes(safeRole) || hasPermissionAccess;

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
