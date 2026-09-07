import React from 'react';
import { Attendances } from './Attendances';
import { AttendanceRecord, Employee, Company, Contract, LeaveRequest, Payslip } from '../types';

export interface AttendanceProps {
  attendance?: AttendanceRecord[];
  employees?: Employee[];
  contracts?: Contract[];
  leaves?: LeaveRequest[];
  payslips?: Payslip[];
  activeCompany?: Company;
  onSaveAttendance?: (rec: AttendanceRecord) => void;
  onSaveAttendanceBatch?: (records: AttendanceRecord[]) => void;
  onPostAttendanceToPayroll?: (month: string, deductionsMap: Record<string, number>) => void;
  onNavigateToApp?: (app: any) => void;
}

export const Attendance: React.FC<AttendanceProps> = () => {
  return <Attendances />;
};

export default Attendance;
