import toast from 'react-hot-toast';
import { downloadKuwaitWPSFile } from '../utils/kuwaitLaw';
import { addDirectEmployeeViaAi } from '../services/tenantDataService';
import { createLeaveDraftViaCopilot } from '../services/copilotLeaveActions';
import { employeeBelongsToTenant } from '../utils/contractTenantRules';
import type { CopilotRuntime } from '../context/CopilotContext';
import type { CopilotAction, CopilotActionType } from './aiCopilotTypes';
import type { Employee } from '../types';

export interface CopilotActionExecutorOptions {
  runtime: CopilotRuntime;
  close?: () => void;
  isArabic?: boolean;
}

function scopedEmployees(runtime: CopilotRuntime): Employee[] {
  const companyId = runtime.companyId;
  const list = runtime.employees || [];
  if (!companyId) return list;
  return list.filter((e) => employeeBelongsToTenant(e, companyId));
}

export async function executeCopilotAction(
  action: CopilotAction,
  opts: CopilotActionExecutorOptions
): Promise<boolean> {
  const { runtime, close, isArabic = true } = opts;
  const { companyId, onQuickAction, setActiveApp } = runtime;
  const employees = scopedEmployees(runtime);

  const finish = () => {
    close?.();
  };

  switch (action.type) {
    case 'NAVIGATE': {
      if (!action.appId) return false;
      const payload =
        action.appTab && action.appId === 'leaves'
          ? { appId: action.appId, tab: action.appTab }
          : action.appId;
      if (onQuickAction) onQuickAction('navigate', payload);
      else setActiveApp?.(action.appId);
      finish();
      return true;
    }
    case 'OPEN_MODAL': {
      if (action.modal === 'new_employee') onQuickAction?.('new_employee');
      else if (action.modal === 'pam_contract') onQuickAction?.('navigate', 'contracts');
      else if (action.modal === 'upload_doc') onQuickAction?.('navigate', 'scanner');
      else onQuickAction?.(action.modal || 'new_employee');
      finish();
      return true;
    }
    case 'OPEN_CALCULATOR': {
      onQuickAction?.('calculator');
      finish();
      return true;
    }
    case 'TRIGGER_FUNCTION': {
      if (action.functionName === 'export_wps' || !action.functionName) {
        const wpsEmployees = employees
          .filter((e) => e.civilId && e.iban)
          .map((e) => ({
            civil_id: e.civilId,
            bank_code: 'KFH',
            iban: e.iban,
            basic_salary: Number((e as any).basicSalary || (e as any).salary) || 0,
            allowances: 0,
            deductions: 0,
            net_salary: Number((e as any).basicSalary || (e as any).salary) || 0,
          }));
        if (wpsEmployees.length === 0) {
          toast.error(
            isArabic
              ? 'لا يمكن إنشاء ملف WPS قبل توفر الرقم المدني وIBAN الفعلي للموظفين.'
              : 'WPS requires civil ID and IBAN on employees.'
          );
          finish();
          return false;
        }
        downloadKuwaitWPSFile(
          {
            companyMOSALId: '301122',
            employerBankCode: 'KFH',
            payrollMonthYear: new Date().toISOString().slice(0, 7),
          },
          wpsEmployees
        );
        toast.success(
          isArabic ? 'تم تنزيل ملف حماية الأجور (WPS) بنجاح' : 'WPS file downloaded.'
        );
      }
      finish();
      return true;
    }
    case 'CREATE_EMPLOYEE': {
      if (!action.employeeData || !companyId) {
        toast.error(isArabic ? 'لا يوجد شركة نشطة.' : 'No active company.');
        return false;
      }
      try {
        const created = await addDirectEmployeeViaAi(companyId, action.employeeData, employees);
        toast.success(
          isArabic
            ? `تم إضافة الموظف (${created.fullNameAr || action.employeeData.nameAr || 'الجديد'}) بنجاح!`
            : 'Employee added successfully.'
        );
        onQuickAction?.('navigate', 'employees');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الموظف');
        return false;
      }
      finish();
      return true;
    }
    case 'CREATE_LEAVE_DRAFT': {
      if (!action.leaveDraft || !companyId) {
        toast.error(isArabic ? 'لا يوجد شركة نشطة أو بيانات مسودة ناقصة.' : 'Missing company or draft data.');
        return false;
      }
      try {
        const result = await createLeaveDraftViaCopilot(companyId, action.leaveDraft, employees, {
          submitForApproval: Boolean(action.leaveDraft.submitForApproval),
        });
        const statusLabel = result.status.includes('DRAFT')
          ? isArabic
            ? 'مسودة'
            : 'draft'
          : isArabic
            ? 'بانتظار اعتماد المدير'
            : 'pending manager';
        toast.success(
          isArabic
            ? `تم إنشاء طلب إجازة (${statusLabel}) للموظف ${result.employeeName} — ${result.id}`
            : `Leave request ${result.id} created (${statusLabel}).`
        );
        onQuickAction?.('open_leave_draft', { leaveRequestId: result.id, employeeId: result.employeeId });
        onQuickAction?.('navigate', 'leaves');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'تعذر إنشاء مسودة الإجازة');
        return false;
      }
      finish();
      return true;
    }
    default:
      return false;
  }
}

export const COPILOT_ACTION_TYPES: CopilotActionType[] = [
  'NAVIGATE',
  'OPEN_MODAL',
  'TRIGGER_FUNCTION',
  'CREATE_EMPLOYEE',
  'OPEN_CALCULATOR',
  'CREATE_LEAVE_DRAFT',
];
