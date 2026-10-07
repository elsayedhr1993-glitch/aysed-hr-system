import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, ShieldCheck, GitBranch } from 'lucide-react';
import type { CompanyComplianceDoc } from '../../types';
import { subscribeCompanyCompliance } from '../../services/companyComplianceService';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';

interface Props {
  companyId: string;
  onOpenDocuments?: () => void;
  onOpenComplianceTree?: () => void;
  /** full = legacy banner; compact = sidebar widget on home launcher */
  variant?: 'full' | 'compact';
}

export const CompanyOnboardingLicensesWidget: React.FC<Props> = ({
  companyId,
  onOpenDocuments,
  onOpenComplianceTree,
  variant = 'full',
}) => {
  const [compliance, setCompliance] = useState<CompanyComplianceDoc | null>(null);

  useEffect(() => {
    if (!isQueryableTenantCompanyId(companyId)) {
      setCompliance(null);
      return;
    }
    return subscribeCompanyCompliance(companyId, setCompliance);
  }, [companyId]);

  if (!isQueryableTenantCompanyId(companyId)) return null;

  const tracks = compliance?.tracks || [];
  const overall = compliance?.overallPercent ?? 0;
  const alerts = compliance?.alertCount ?? 0;

  const statusChip = (status: string) => {
    if (status === 'expired') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (status === 'expiring_soon') return 'bg-amber-100 text-amber-900 border-amber-200';
    if (status === 'missing') return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  const statusLabel = (status: string) => {
    if (status === 'expired') return 'منتهي';
    if (status === 'expiring_soon') return 'قريب الانتهاء';
    if (status === 'missing') return 'غير مسجل';
    return 'ساري';
  };

  if (variant === 'compact') {
    return (
      <aside
        className="w-full xl:w-56 shrink-0 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2"
        aria-label="التراخيص والامتثال"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 size={16} className="text-[#714B67] shrink-0" />
            <span className="text-[11px] font-black text-slate-900 truncate">التراخيص</span>
          </div>
          <span className="text-[10px] font-mono font-black text-[#714B67]">{overall}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-[#714B67] transition-all" style={{ width: `${overall}%` }} />
        </div>
        {alerts > 0 && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md w-fit">
            <AlertTriangle size={10} />
            {alerts}
          </span>
        )}
        <ul className="space-y-1.5">
          {tracks.map((track) => (
            <li key={track.key} className="flex items-center justify-between gap-1 text-[10px]">
              <span className="font-bold text-slate-700 truncate">{track.label}</span>
              <span className={`shrink-0 text-[8px] font-bold px-1 py-0.5 rounded border ${statusChip(track.status)}`}>
                {statusLabel(track.status)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
          {onOpenDocuments && (
            <button
              type="button"
              onClick={onOpenDocuments}
              className="text-[10px] font-bold text-[#714B67] hover:underline text-right cursor-pointer"
            >
              أرشيف التراخيص
            </button>
          )}
          {onOpenComplianceTree && (
            <button
              type="button"
              onClick={onOpenComplianceTree}
              className="text-[10px] font-bold text-slate-600 hover:text-[#714B67] text-right cursor-pointer flex items-center gap-1 justify-end"
            >
              <GitBranch size={11} />
              شجرة الامتثال
            </button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67]">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">الامتثال وتراخيص المنشأة</h3>
            <p className="text-[10px] text-slate-500 font-medium">MOH · البلدية · الإطفاء · PACI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
              <AlertTriangle size={12} />
              {alerts} تنبيه
            </span>
          )}
          <span className="text-xs font-mono font-black text-[#714B67]">{overall}%</span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div className="h-full bg-[#714B67] transition-all" style={{ width: `${overall}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tracks.map((track) => (
          <div key={track.key} className="rounded-xl border border-slate-200/80 p-2.5 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-800 truncate">{track.label}</div>
            <div className={`mt-1.5 inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusChip(track.status)}`}>
              {statusLabel(track.status)}
            </div>
            {track.expiryDate && (
              <div className="text-[9px] text-slate-500 font-mono mt-1">حتى {track.expiryDate}</div>
            )}
          </div>
        ))}
      </div>

      {(onOpenDocuments || onOpenComplianceTree) && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {onOpenComplianceTree && (
            <button
              type="button"
              onClick={onOpenComplianceTree}
              className="flex-1 py-2 text-xs font-bold text-white bg-[#714B67] border border-[#714B67] rounded-xl hover:bg-[#5d3d55] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <GitBranch size={14} />
              شجرة الامتثال الحكومي
            </button>
          )}
          {onOpenDocuments && (
            <button
              type="button"
              onClick={onOpenDocuments}
              className="flex-1 py-2 text-xs font-bold text-[#714B67] border border-[#714B67]/30 rounded-xl hover:bg-purple-50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} />
              أرشيف تراخيص المنشأة
            </button>
          )}
        </div>
      )}
    </div>
  );
};
