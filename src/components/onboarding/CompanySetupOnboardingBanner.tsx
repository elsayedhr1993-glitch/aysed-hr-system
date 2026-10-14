import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  ChevronDown,
  GitBranch,
  Users,
  Palmtree,
} from 'lucide-react';
import type { CompanySetupStepId } from '../../services/companySetupOnboardingService';
import { isCompanySetupBannerDismissed } from '../../services/companySetupOnboardingService';
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
  const [dismissed] = useState(() =>
    companyId ? isCompanySetupBannerDismissed(companyId) : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (!state || dismissed) return null;
  if (state.complete || state.overallPercent >= 100) return null;

  const incomplete = state.steps.filter((step) => !step.done && step.progress < 100);
  const percent = Math.min(100, Math.max(0, state.overallPercent));

  return (
    <div ref={rootRef} className={`relative w-full ${className}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-white/95 ps-3 pe-3 py-2 text-start shadow-xs cursor-pointer hover:border-primary/40"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="shrink-0 text-xs font-black text-primary">
          {lang === 'ar' ? 'تهيئة المنشأة' : 'Company onboarding'}
        </span>
        <span className="shrink-0 text-[11px] font-mono font-bold text-slate-500">{percent}%</span>
        <div
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lang === 'ar' ? 'تقدم تهيئة المنشأة' : 'Company setup progress'}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-primary transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          style={{ marginInline: 0 }}
        >
          {incomplete.length === 0 ? (
            <p className="px-3 py-2.5 text-xs font-medium text-slate-500">
              {lang === 'ar' ? 'لا توجد خطوات ناقصة' : 'No remaining steps'}
            </p>
          ) : (
            incomplete.map((step) => {
              const Icon = stepIcon(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onStepAction(actionForStep(step.id));
                  }}
                  className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-start last:border-b-0 hover:bg-primary/5 cursor-pointer"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-black text-slate-900">
                      {lang === 'ar' ? step.titleAr : step.titleEn}
                    </span>
                    <span className="block text-[10px] text-slate-500 leading-snug">{step.hintAr}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-mono font-bold text-slate-400">{step.progress}%</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
