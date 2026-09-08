const fs = require('fs');
let content = fs.readFileSync('./src/components/employees/tabs/EmployeeWorkTab.tsx', 'utf8');

if (!content.includes('import { DollarSign }')) {
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { DollarSign } from 'lucide-react';");
}

const computations = `
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
    employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
    
  const basicSalary = parseFloat(employee.basicSalary || '0') || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || '0') || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || '0') || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || '0') || 0;
  const otherAllowance = parseFloat(employee.otherAllowance || '0') || 0;
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;
  const dailyWage = totalSalary > 0 ? (totalSalary / 26) : 0;
`;

if (!content.includes('const dailyWage')) {
    content = content.replace("}) => {\n  return", "}) => {\n" + computations + "  return");
}

fs.writeFileSync('./src/components/employees/tabs/EmployeeWorkTab.tsx', content);
console.log("Fixed Work Tab");
