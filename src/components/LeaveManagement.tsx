import React from 'react';
import { OdooTimeOffApp } from './OdooTimeOffApp';
import { LeaveRequest, Employee, Company, ViewMode, Contract, AttendanceRecord } from '../types';

export interface LeaveManagementProps {
  autoOpenNewLeaveForEmpId?: string | null;
  onClearAutoOpenLeave?: () => void;
  leaves: LeaveRequest[];
  employees: Employee[];
  contracts?: Contract[];
  attendance?: AttendanceRecord[];
  activeCompany: Company;
  viewMode: ViewMode;
  searchTerm: string;
  filterTab: string;
  onSaveLeave: (leave: LeaveRequest) => void;
  onUpdateLeaveStatus: (leaveId: string, status: 'APPROVED' | 'REJECTED', note?: string) => void;
  onDeleteLeave?: (leaveId: string, force?: boolean) => Promise<boolean> | boolean | void;
  onSaveEmployee?: (emp: Employee) => void;
  initialEmployeeId?: string;
  onOpenNotificationModal?: (emp: Employee, trigger?: any, data?: any) => void;
  onNavigateToApp?: (app: any) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = () => {
  return <OdooTimeOffApp />;
};

export default LeaveManagement;
