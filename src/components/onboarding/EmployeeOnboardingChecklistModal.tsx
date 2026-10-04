import React from 'react';
import { X } from 'lucide-react';
import { EmployeeOnboardingPlanPanel } from './EmployeeOnboardingPlanPanel';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <EmployeeOnboardingPlanPanel
            employeeId={employeeId}
            companyId={companyId}
            employee={employee}
            employeeName={employeeName}
            compact
          />
        </div>
      </div>
    </div>
  );
};
