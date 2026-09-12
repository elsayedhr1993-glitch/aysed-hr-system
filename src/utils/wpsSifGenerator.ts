import { EmployeeContract } from '../context/OdooHierarchyContext';
import { PayrollCalculationResult } from './kuwaitPayrollEngine';

/**
 * Kuwait WPS SIF (Salary Information File) Generator
 * Generates the official format required by Kuwaiti banks for salary transfers.
 * 
 * Format typically requires:
 * Header: Employer ID, Payer Bank Short Name, Creation Date, Time, etc.
 * Records: Employee Civil ID, Bank Code, Account/IBAN, Basic, Allowances, Deductions, Net, etc.
 */

export function generateWpsSifFile(
  companyId: string,
  companyName: string,
  employerMosaCode: string, // Ministry of Social Affairs Code (File Number)
  salaryMonth: string, // YYYY-MM format expected
  payrollRecords: { employee: EmployeeContract; calculation: PayrollCalculationResult }[]
): string {
  
  const creationDate = new Date().toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
  const creationTime = new Date().toISOString().slice(11,19).replace(/:/g, ''); // HHMMSS
  const formattedMonth = salaryMonth.replace('-', ''); // YYYYMM

  // 1. Header Record (Example standard format)
  // ED, Employer_File_No, Date, Time, Month
  const header = `ED,${employerMosaCode},${creationDate},${creationTime},${formattedMonth}`;

  // 2. Detail Records
  const records = payrollRecords.map((record) => {
    const { employee, calculation } = record;
    
    // Fallback formats
    const civilId = employee.civilId || '000000000000';
    const iban = employee.iban || 'KW00000000000000000000000000000';
    const bankCode = (employee.bankName || 'KFH').substring(0, 4).toUpperCase(); 
    
    // Formatting amounts to 3 decimal places as required in Kuwait (KWD)
    const basic = calculation.basicSalary.toFixed(3);
    const allow = calculation.allowances.toFixed(3);
    const deduct = (calculation.absenceDeduction + calculation.delayDeduction + calculation.socialSecurityDeduction).toFixed(3);
    const net = calculation.netSalary.toFixed(3);

    // Format: Civil ID, Bank Code, IBAN, Basic, Allowances, Deductions, Net Salary, Remarks
    return `${civilId},${bankCode},${iban},${basic},${allow},${deduct},${net},SALARY`;
  });

  // 3. Footer Record (Optional, sometimes required by specific banks)
  const totalNet = payrollRecords.reduce((sum, r) => sum + r.calculation.netSalary, 0).toFixed(3);
  const footer = `TOTAL,${payrollRecords.length},${totalNet}`;

  // Combine
  return [header, ...records, footer].join('\r\n');
}

export function downloadSifFile(sifContent: string, filename: string) {
  const blob = new Blob([sifContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
