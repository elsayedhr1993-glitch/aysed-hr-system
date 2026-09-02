const fs = require('fs');
let content = fs.readFileSync('src/components/OdooPayrollApp.tsx', 'utf8');

content = content.replace("pifssDeduction: 126, // 10.5% تأمينات للموظف الكويتي", "pifssDeduction: 0, // معفى قانوناً (0% قطاع أهلي)");
content = content.replace("netSalary: 1474,", "netSalary: 1600, // 1200 + 300 + 100");

fs.writeFileSync('src/components/OdooPayrollApp.tsx', content, 'utf8');
