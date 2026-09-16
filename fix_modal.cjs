const fs = require('fs');
let c = fs.readFileSync('src/components/LeaveSettlementModal.tsx', 'utf8');

c = c.replace(
  /import \{ validateLeaveSettlement \} from '\.\.\/services\/guards';/,
  "import { validateLeaveSettlement } from '../services/guards';\nimport { calculateUniversalLeaveSettlement } from '../services/leaveSettlementService';"
);

c = c.replace(
  /const numReq = Number\(requestedDays\);[\s\S]*?try \{[\s\S]*?validateLeaveSettlement\(\{[\s\S]*?\}\);[\s\S]*?\} catch \(guardErr: any\) \{[\s\S]*?return;[\s\S]*?\}/,
  `const numReq = Number(requestedDays);
    
    // Use the Universal Settlement Engine to strictly validate the financial math
    try {
      const settlement = calculateUniversalLeaveSettlement({
        companyId: effEmployee.companyId || 'comp-main',
        employeeId: effEmployee.id,
        settlementDate: new Date().toISOString().split('T')[0],
        settlementMode: 'ENCASHMENT_LIQUIDATION',
        basicSalary: summary.basicSalary || 0,
        grossSalary: summary.basicSalary || 0,
        carriedOverBalance: carriedOver,
        accruedBalance: accrued,
        totalAvailableBalance: totalAvailable,
        requestedLeaveDays: numReq,
        statutoryLeaveDays: 0,
        consumedLeaveDays: 0,
        unpaidLeaveDays: 0,
        includeProratedSalary: false,
        workedDaysInMonth: 0,
        proratedSalaryDivisor: 26,
        includeOvertime: false,
        overtimeHours: 0,
        overtimeMultiplier: 1.25,
        includeEncashment: true,
        encashmentDays: numReq,
        paymentMethod: 'BANK_TRANSFER'
      });
      
      // We pass validation guard on universal math rules
      validateLeaveSettlement({
        carriedOver,
        accrued,
        totalAvailable,
        requestedDays: numReq,
        balanceRemaining: settlement.remainingBalanceAfter
      });
    } catch (guardErr: any) {
      toast.error(guardErr.message || 'خطأ في التحقق من صحة التسوية المالية');
      return;
    }`
);

fs.writeFileSync('src/components/LeaveSettlementModal.tsx', c);
