import React from 'react';
import { Building2 } from 'lucide-react';
import type { Company } from '../../types';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';

export interface OfficialA4CompanyLetterheadProps {
  company?: Company | null;
  /** Subtitle under company name (e.g. department line). */
  departmentLine?: string;
  /** Extra line below registry row. */
  subtitle?: string;
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  className?: string;
  showKuwaitMinistryLine?: boolean;
  showPamWps?: boolean;
  logoClassName?: string;
}

/**
 * Single UI source for A4/PDF official letterheads — data from getCompanyPrintProfile(company).
 */
export const OfficialA4CompanyLetterhead: React.FC<OfficialA4CompanyLetterheadProps> = ({
  company,
  departmentLine,
  subtitle,
  rightSlot,
  centerSlot,
  className = '',
  showKuwaitMinistryLine = false,
  showPamWps = true,
  logoClassName = 'w-16 h-16',
}) => {
  const profile = getCompanyPrintProfile(company);
  const layout = centerSlot ? 'grid grid-cols-1 sm:grid-cols-3 gap-4 items-start' : 'flex justify-between items-start gap-4';

  return (
    <div className={`border-b-2 border-slate-900 pb-4 ${className}`}>
      <div className={layout}>
        <div className="flex items-start gap-3 min-w-0">
          {profile.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={profile.displayNameAr}
              className={`${logoClassName} object-contain rounded-lg border border-slate-200 bg-white shrink-0`}
            />
          ) : (
            <div
              className={`${logoClassName} rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0`}
            >
              <Building2 className="text-[#714B67]" size={28} />
            </div>
          )}
          <div className="space-y-1 min-w-0">
            {showKuwaitMinistryLine && (
              <div className="text-[11px] font-bold text-slate-500">
                دولة الكويت — وزارة الشؤون الاجتماعية والعمل
              </div>
            )}
            <h2 className="text-xl font-black text-slate-900 leading-tight">{profile.displayNameAr}</h2>
            {profile.displayNameEn && profile.displayNameEn !== '—' && profile.displayNameEn !== profile.displayNameAr && (
              <p className="text-[11px] font-bold text-slate-500" dir="ltr">{profile.displayNameEn}</p>
            )}
            {departmentLine && <p className="text-xs font-bold text-slate-600">{departmentLine}</p>}
            {subtitle && <p className="text-[11px] text-slate-600">{subtitle}</p>}
            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
              <span>
                الرقم المدني للجهة:{' '}
                <strong className="font-mono text-slate-900">{profile.civilIdCompany}</strong>
              </span>
              <span>
                السجل التجاري: <strong className="font-mono text-slate-900">{profile.commercialReg}</strong>
              </span>
              {showPamWps && profile.wsiCode !== '—' && (
                <span>
                  ملف الشؤون (PAM/WPS):{' '}
                  <strong className="font-mono text-slate-900">{profile.wsiCode}</strong>
                </span>
              )}
              {profile.paciNumber !== '—' && (
                <span>
                  الرقم الآلي (PACI): <strong className="font-mono text-slate-900">{profile.paciNumber}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {centerSlot && <div className="flex justify-center">{centerSlot}</div>}

        {rightSlot && <div className="text-left shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
};

/** Compact header row (payslip / bank letter) without large logo block. */
export const OfficialA4CompanyLetterheadCompact: React.FC<{
  company?: Company | null;
  rightSlot?: React.ReactNode;
  className?: string;
}> = ({ company, rightSlot, className = '' }) => {
  const profile = getCompanyPrintProfile(company);
  return (
    <div className={`border-b-2 border-slate-800 pb-5 mb-5 flex justify-between items-start gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-base font-black text-slate-900">{profile.displayNameAr}</h1>
        {profile.displayNameEn !== '—' && (
          <p className="text-[11px] font-semibold text-slate-500">{profile.displayNameEn}</p>
        )}
        <p className="text-[10px] text-slate-500 mt-1 font-mono">
          سجل تجاري: {profile.commercialReg} | الرقم المدني للجهة: {profile.civilIdCompany} | دولة الكويت
        </p>
      </div>
      {rightSlot}
    </div>
  );
};
