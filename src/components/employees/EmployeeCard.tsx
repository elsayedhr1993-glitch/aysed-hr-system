import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { EmployeeDirectoryViewRow } from '../../utils/employeeMapper';
import { resolveEmployeeAvatarUrl } from '../../utils/employeeAvatar';
import type { ActiveOnboardingDirectoryKeys } from '../../utils/filterEmployeesDirectory';
import {
  buildEmployeeDirectoryTags,
  employeeDirectoryPresenceOnline,
  employeeHasDocumentAlert,
} from '../../utils/filterEmployeesDirectory';
import { checkDocumentExpiry } from '../../utils/dateUtils';

export interface EmployeeCardProps {
  employee: EmployeeDirectoryViewRow;
  activeOnboardingKeys: ActiveOnboardingDirectoryKeys;
  statusBadge: React.ReactNode;
  menuOpen: boolean;
  onMenuToggle: () => void;
  menuContent: React.ReactNode;
  avatarBroken: boolean;
  onAvatarBroken: () => void;
  onSelect: () => void;
  docAlerts?: React.ReactNode;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  activeOnboardingKeys,
  statusBadge,
  menuOpen,
  onMenuToggle,
  menuContent,
  avatarBroken,
  onAvatarBroken,
  onSelect,
  docAlerts,
}) => {
  const displayName = employee.nameAr || employee.fullNameAr || 'موظف';
  const initials = displayName.replace(/\s+/g, '').slice(0, 2) || 'مو';
  const avatarUrl = resolveEmployeeAvatarUrl(employee as Record<string, unknown>);
  const showAvatarImage = Boolean(avatarUrl) && !avatarBroken;
  const tags = buildEmployeeDirectoryTags(employee);
  const online = employeeDirectoryPresenceOnline(employee, activeOnboardingKeys);
  const hasDocAlert = employeeHasDocumentAlert(employee);

  const civilExp =
    employee.civilIdExpiry ||
    (employee as { civilIdExpiryDate?: string }).civilIdExpiryDate ||
    (employee as { civil_id_expiry?: string }).civil_id_expiry;
  const passExp = employee.passportExpiry;
  const civilStatus = checkDocumentExpiry(civilExp, 'البطاقة المدنية');
  const passStatus = checkDocumentExpiry(passExp, 'جواز السفر');
  const borderClass =
    civilStatus.isExpired || passStatus.isExpired
      ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
      : hasDocAlert
        ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
        : 'border-[#dee2e6] hover:border-primary/35';

  const email = String(
    employee.email || (employee as { workEmail?: string }).workEmail || ''
  ).trim();
  const phone = String(employee.phone || '').trim();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`odoo-employee-kanban-card group relative flex flex-col h-full min-w-0 bg-white rounded border shadow-[0_1px_2px_rgba(16,24,40,0.06)] hover:shadow-md transition-all cursor-pointer text-right ${borderClass}`}
    >
      <div className="flex gap-3 p-3.5 flex-1 min-h-0">
        <div className="shrink-0 w-[76px] h-[76px] rounded overflow-hidden border border-slate-200/90 bg-slate-50">
          {showAvatarImage ? (
            <img
              src={avatarUrl!}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={onAvatarBroken}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-white font-bold text-lg ${employee.avatarColor || 'bg-primary'}`}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-[#212529] text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors"
              title={displayName}
            >
              {displayName}
            </h3>
            <div className="shrink-0 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle();
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                title="خيارات"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <p className="text-[12px] text-[#6c757d] line-clamp-2 leading-snug">
            {employee.jobTitle || 'موظف'}
          </p>
        </div>
      </div>

      <footer
        className="px-3 pb-3 pt-1 flex items-center justify-end gap-2 mt-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="group relative inline-flex">
          <span className="[&>span:last-child]:hidden">{statusBadge}</span>
          <span
            role="tooltip"
            className="pointer-events-none absolute z-20 hidden w-56 whitespace-normal rounded bg-slate-900 px-2 py-1 text-[10px] font-normal text-white group-hover:block group-focus-within:block"
            style={{ bottom: '100%', insetInlineStart: 0 }}
          >
            <span className="block">{statusBadge}</span>
            {employee.dept || employee.department ? <span className="block">{employee.dept || employee.department}</span> : null}
            {email ? <span className="block">{email}</span> : null}
            {phone ? <span className="block" dir="ltr">{phone}</span> : null}
            {tags.length > 0 ? <span className="block">{tags.join('، ')}</span> : null}
            <span className="block">{online ? 'متاح' : 'غير متصل'}</span>
          </span>
        </span>
      </footer>

      {menuOpen ? (
        <div className="absolute top-10 left-2 z-50" onClick={(e) => e.stopPropagation()}>
          {menuContent}
        </div>
      ) : null}

      {docAlerts}
    </article>
  );
};
