import fs from 'fs';
let content = fs.readFileSync('src/components/OdooTimeOffApp.tsx', 'utf8');
content = content.replace(
  /const empAllocs = buildEmployeeBaselineAllocations\(emp, mappedAllocations as any\);/,
  'const empAllocs = buildEmployeeBaselineAllocations(emp as any, mappedAllocations as any);'
);
content = content.replace(
  /const fifo = computeFifoLeaveAllocations\(emp, empAllocs, requests as any\);/,
  'const fifo = computeFifoLeaveAllocations(emp as any, empAllocs, requests as any);'
);
content = content.replace(
  /const totalCompensatory = getGlobalCompensatoryDays\(emp\);/,
  'const totalCompensatory = getGlobalCompensatoryDays(emp as any);'
);
fs.writeFileSync('src/components/OdooTimeOffApp.tsx', content);
