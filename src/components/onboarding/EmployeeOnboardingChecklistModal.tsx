import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Circle, ListChecks, Loader2 } from 'lucide-react';
import type { EmployeeOnboardingChecklistDoc } from '../../types';
import {
  subscribeEmployeeOnboardingChecklist,
  toggleEmployeeOnboardingStep,
} from '../../services/employeeOnboardingChecklistService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  companyId: string;
  employee: Record<string, unknown>;
  employeeName?: string;
}

export const EmployeeOnboardingChecklistModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employeeId,
  companyId,
  employee,
  employeeName,
}) => {
  const [checklist, setChecklist] = useState<EmployeeOnboardingChecklistDoc | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !employeeId || !companyId) return;
    return subscribeEmployeeOnboardingChecklist(employeeId, companyId, employee, setChecklist);
  }, [isOpen, employeeId, companyId, employee]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#714B67] font-bold text-sm">
              <ListChecks size={18} />
              <span>خطة التهيئة (Onboarding)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{employeeName || 'الموظف'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={busy}
                    onClick={() => handleToggle(step.id, !step.completed)}
                    className={`w-full text-right flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      step.completed
                        ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-[#714B67]/40'
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="w-5 h-5 shrink-0 animate-spin text-slate-400" />
                    ) : step.completed ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-slate-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-900">{step.title}</div>
                      {step.completed && step.completedAt && (
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5">أُنجز: {step.completedAt}</div>
                      )}
                    </div>
                  </button>
                );
              })
          )}
        </div>

      </div>
    </div>
  );
};
