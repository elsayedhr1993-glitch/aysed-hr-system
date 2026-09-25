import type { KuwaitPublicHolidayRecord } from '../../data/kuwaitPublicHolidays2026';

export type PublicHoliday = KuwaitPublicHolidayRecord;

export interface HolidayDutyAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  jobTitle: string;
  department?: string;
  holidayName: string;
  dutyDate: string;
  basicSalary: number;
  totalSalary: number;
  compensationType: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave';
  calculatedAmount: number;
  status: 'approved' | 'settled';
  settledAt?: string;
}
