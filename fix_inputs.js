import fs from 'fs';

let detailFile = 'src/components/employees/OdooEmployeeDetailView.tsx';
let detailContent = fs.readFileSync(detailFile, 'utf8');

detailContent = detailContent.replace(
  /value=\{employee\.hireDate \? employee\.hireDate\.slice\(0, 10\) : '2026-01-01'\}/g,
  "value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}"
);
detailContent = detailContent.replace(
  /value=\{employee\.contractStartDate \? employee\.contractStartDate\.slice\(0, 10\) : '2026-01-01'\}/g,
  "value={employee.contractStartDate ? employee.contractStartDate.slice(0, 10) : ''}"
);

fs.writeFileSync(detailFile, detailContent);
