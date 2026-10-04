import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  GitBranch,
  Users,
  Palmtree,
} from 'lucide-react';
import type { CompanySetupStepId } from '../../services/companySetupOnboardingService';
import {
  dismissCompanySetupBanner,
  isCompanySetupBannerDismissed,
} from '../../services/companySetupOnboardingService';
import { useCompanySetupOnboarding } from '../../hooks/useCompanySetupOnboarding';
import type { Company } from '../../types';
import { useLang } from '../../lib/i18n';

export type CompanySetupStepAction =
  | { type: 'settings'; section: string }
  | { type: 'compliance_tree' }
  | { type: 'company_documents' }
  | { type: 'employees_org' }
  | { type: 'leave_wizard' }
  | { type: 'attendance_setup' };

interface Props {
  company: Company | null | undefined;
  employeesCount: number;
  distinctJobTitles: number;
  onStepAction: (action: CompanySetupStepAction) => void;
  className?: string;
}

const stepIcon = (id: CompanySetupStepId) => {
  switch (id) {
    case 'company_profile':
      return Building2;
    case 'gov_compliance':
      return GitBranch;
    case 'org_structure':
      return Users;
    case 'work_policies':
      return Palmtree;
    default:
      return Building2;
  }
};

function actionForStep(id: CompanySetupStepId): CompanySetupStepAction {
  switch (id) {
    case 'company_profile':
      return { type: 'settings', section: 'company' };
    case 'gov_compliance':
      return { type: 'compliance_tree' };
    case 'org_structure':
      return { type: 'employees_org' };
    case 'work_policies':
      return { type: 'settings', section: 'leaves' };
    default:
      return { type: 'settings', section: 'company' };
  }
}

export const CompanySetupOnboardingBanner: React.FC<Props> = ({
  company,
  employeesCount,
  distinctJobTitles,
  onStepAction,
  className = '',
}) => {
  const { lang } = useLang();
  const companyId = company?.id || '';
  const state = useCompanySetupOnboarding(company, employeesCount, distinctJobTitles);
  const [dismissed, setDismissed] = useState(() =>
    companyId ? isCompanySetupBannerDismissed(companyId) : false
  );

  if (!state || dismissed) return null;
  if (state.complete && isCompanySetupBannerDismissed(companyId)) return null;

  const handleDismiss = () => {
    if (!state.complete || !companyId) return;
    dismissCompanySetupBanner(companyId);
    setDismissed(true);
  };

  return (
    <div
      className={`w-full rounded-2xl border border-[#714B67]/25 bg-gradient-to-l from-[#714B67]/8 via-white to-white shadow-sm overflow-hidden ${className}`}
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#714B67] text-white">
        <div className="min-w-0">
          <div className="text-xs font-black tracking-tight">
            {lang === 'ar' ? 'تهيئة المنشأة' : 'Company onboarding'}
            <span className="text-white/70 font-medium mx-1.5">·</span>
            <span className="text-[10px] font-mono text-amber-200">{state.overallPercent}%</span>
          </div>
          <p className="text-[10px] text-white/80 font-medium mt-0.5">
            {lang === 'ar'
              ? 'أكمل الخطوات لتهيئة المنشأة وفق Odoo 18'
              : 'Complete setup steps (Odoo 18 style)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-28 h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-amber-300 transition-all duration-500"
              style={{ width: `${state.overallPercent}%` }}
            />
          </div>
          {state.complete && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer"
              title={lang === 'ar' ? 'إخفاء الشريط' : 'Dismiss banner'}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-3 sm:px-4 flex flex-col lg:flex-row gap-3 lg:items-stretch">
        {state.steps.map((step, index) => {
          const Icon = stepIcon(step.id);
          const done = step.done || step.progress >= 100;
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepAction(actionForStep(step.id))}
                className={`flex-1 min-w-[140px] text-right rounded-xl border p-3 transition cursor-pointer group ${
                  done
                    ? 'bg-emerald-50/90 border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-[#714B67]/40 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-slate-50 border-slate-300 text-[#714B67]'
                    }`}
                  >
                    {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">{step.progress}%</span>
                </div>
                <div className="mt-2 text-xs font-black text-slate-900 leading-tight">
                  {lang === 'ar' ? step.titleAr : step.titleEn}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">{step.hintAr}</p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#714B67] mt-2 opacity-0 group-hover:opacity-100 transition">
                  {lang === 'ar' ? 'متابعة' : 'Continue'}
                  <ChevronRight size={12} className="rotate-180" />
                </span>
              </button>
              {index < state.steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-1 text-slate-300">
                  <Circle size={6} className="fill-current" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
