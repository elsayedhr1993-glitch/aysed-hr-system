import { calculateEmployeePayroll } from './src/utils/kuwaitPayrollEngine';

const emp = {
  id: 'test-123',
  basicSalary: 780,
  housingAllowance: 0,
  transportAllowance: 0,
  medicalAllowance: 0,
  isKuwaiti: false
} as any;

const att = {
  unpaidAbsenceDays: 2,
  delayMinutes: 0,
  overtimeHours: 0
} as any;

const result = calculateEmployeePayroll(emp, att);
console.log("=== إثبات الحسبة المحاسبية الرسمية (قانون 26 يوم) ===");
console.log(`الراتب الإجمالي المستحق: ${result.grossSalary} د.ك`);
console.log(`احتساب أجر اليوم الواحد (780 ÷ 26): ${780 / 26} د.ك`);
console.log(`أيام الغياب: ${result.unpaidAbsenceDays} أيام`);
console.log(`قيمة الخصم (يومين × 30): ${result.absenceDeduction} د.ك`);
console.log(`الراتب الصافي المتبقي: ${result.netSalary} د.ك`);
console.log("====================================================");
