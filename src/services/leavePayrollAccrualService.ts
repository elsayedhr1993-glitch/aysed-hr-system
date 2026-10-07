import { doc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import type { LeaveRequest } from '../components/OdooTimeOffApp';
import { calculateKuwaitLeaveCashAmount } from '../utils/kuwaitPayrollMath';
import { isAnnualLeaveType } from '../utils/leaveModel';
import { resolveAnnualTicketAllowanceKwd } from '../utils/leaveEngine';

export interface LeavePayrollAccrualDoc {
  id: string;
  companyId: string;
  leaveRequestId: string;
  employeeId: string;
  employeeName: string;
  kind: 'leave_approval_accrual';
  paidDays: number;
  unpaidDays: number;
  basicSalary: number;
  leaveCashAmountKwd: number;
  ticketAllowanceKwd: number;
  article71AdvanceRequested: boolean;
  status: 'pending_payroll';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export async function exportLeavePayrollAccrualOnApproval(
  companyId: string,
  request: LeaveRequest,
  employeeRecord?: Record<string, unknown> | null,
  leavePolicy?: Record<string, unknown>
): Promise<string> {
  const paidDays = Number(request.paidDays ?? request.daysCount ?? 0) || 0;
  const unpaidDays = Number(request.unpaidDays ?? 0) || 0;
  const basicSalary = Number(request.basicSalary ?? 0) || 0;
  const leaveCash =
    isAnnualLeaveType(request.leaveType) && paidDays > 0
      ? calculateKuwaitLeaveCashAmount(paidDays, basicSalary)
      : 0;
  const ticketAllowance =
    request.requestAdvanceSalaryArticle71 && isAnnualLeaveType(request.leaveType)
      ? resolveAnnualTicketAllowanceKwd(employeeRecord, leavePolicy)
      : 0;

  const id = `lacc_${request.id}`;
  const payload: LeavePayrollAccrualDoc = {
    id,
    companyId,
    leaveRequestId: request.id,
    employeeId: request.employeeId,
    employeeName: request.employeeName,
    kind: 'leave_approval_accrual',
    paidDays,
    unpaidDays,
    basicSalary,
    leaveCashAmountKwd: leaveCash,
    ticketAllowanceKwd: ticketAllowance,
    article71AdvanceRequested: Boolean(request.requestAdvanceSalaryArticle71),
    status: 'pending_payroll',
    startDate: request.startDate,
    endDate: request.endDate,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'payroll_leave_accruals', id), cleanFirestoreData(payload), { merge: true });
  return id;
}
