import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  Loader2,
  UserRound,
} from 'lucide-react';
import type { EmployeeOnboardingChecklistDoc, EmployeeOnboardingTaskStatus } from '../../types';
import {
  subscribeEmployeeOnboardingChecklist,
  toggleEmployeeOnboardingStep,
} from '../../services/employeeOnboardingChecklistService';

interface Props {
  employeeId: string;
  companyId: string;
  employee: Record<string, unknown>;
  employeeName?: string;
  compact?: boolean;
}

const statusMeta: Record<
  EmployeeOnboardingTaskStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'قيد الانتظار',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Clock size={12} />,
  },
  completed: {
    label: 'مكتملة',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 size={12} />,
  },
  overdue: {
    label: 'متأخرة',
    className: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: <AlertTriangle size={12} />,
  },
};

export const EmployeeOnboardingPlanPanel: React.FC<Props> = ({
  employeeId,
  companyId,
  employee,
  employeeName,
  compact = false,
}) => {
  const [checklist, setChecklist] = useState<EmployeeOnboardingChecklistDoc | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId || !companyId) return;
    return subscribeEmployeeOnboardingChecklist(employeeId, companyId, employee, setChecklist);
  }, [employeeId, companyId, employee]);

  const progress = checklist?.progressPercent ?? 0;

  const handleToggle = async (stepId: string, completed: boolean) => {
    if (!checklist) return;
    setSavingId(stepId);
    try {
      const next = await toggleEmployeeOnboardingStep(checklist, stepId, completed);
      setChecklist(next);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white overflow-hidden ${
        compact ? '' : 'shadow-xs'
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#714B67] font-bold text-sm">
          <ListChecks size={18} />
          <span>خطة التهيئة / Onboarding</span>
        </div>
        {employeeName && <span className="text-xs text-slate-500">{employeeName}</span>}
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span>التقدم الكلي</span>
          <span className="font-mono text-[#714B67]">{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-[#714B67] to-emerald-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`p-4 space-y-2 ${compact ? 'max-h-[420px] overflow-y-auto' : ''}`}>
        {!checklist ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : (
          checklist.steps
            .sort((a, b) => a.order - b.order)
            .map((step) => {
              const busy = savingId === step.id;
              const status: EmployeeOnboardingTaskStatus =
                step.status || (step.completed ? 'completed' : 'pending');
              const meta = statusMeta[status];
              return (
                <div
                  key={step.id}
                  className={`rounded-xl border p-3 ${
                    step.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggle(step.id, !step.completed)}
                      className="flex items-start gap-2 text-right flex-1 min-w-0 cursor-pointer disabled:opacity-60"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900">{step.title}</div>
                        {step.titleEn && (
                          <div className="text-[10px] text-slate-500 font-medium" dir="ltr">
                            {step.titleEn}
                          </div>
                        )}
                        {step.description && (
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                        )}
                      </div>
                    </button>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.className}`}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500 font-medium">
                    {step.dueDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        استحقاق: <span className="font-mono text-slate-700">{step.dueDate}</span>
                      </span>
                    )}
                    {step.responsible && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={11} />
                        {step.responsible}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};
