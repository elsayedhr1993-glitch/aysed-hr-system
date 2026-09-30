import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { CompanyComplianceDoc } from '../../types';
import { subscribeCompanyCompliance } from '../../services/companyComplianceService';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';

interface Props {
  companyId: string;
  onOpenDocuments?: () => void;
}

export const CompanyOnboardingLicensesWidget: React.FC<Props> = ({ companyId, onOpenDocuments }) => {
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

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67]">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">تهيئة المنشأة والتراخيص</h3>
            <p className="text-[10px] text-slate-500 font-medium">Company Onboarding &amp; Licences</p>
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

      {onOpenDocuments && (
        <button
          type="button"
          onClick={onOpenDocuments}
          className="mt-3 w-full py-2 text-xs font-bold text-[#714B67] border border-[#714B67]/30 rounded-xl hover:bg-purple-50 transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ShieldCheck size={14} />
          فتح أرشيف تراخيص المنشأة
        </button>
      )}
    </div>
  );
};
