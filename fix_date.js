import fs from 'fs';

let filesToFix = [
  'src/apps/EmployeesApp.tsx',
  'src/components/OdooEmployeesDirectoryApp.tsx',
];

for (let file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/apps/EmployeesApp.tsx') {
    // 1. Employee selection fallback fix
    content = content.replace(
      /hireDate: emp\.joinDate \|\| \(emp as any\)\.hireDate \|\| new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/g,
      "hireDate: emp.joinDate || (emp as any).hireDate || ''"
    );
    // 2. update handling fallback
    content = content.replace(
      /joinDate: \(updatedEmp\.hireDate \|\| updatedEmp\.joinDate \|\| '2026-01-01'\)\.slice\(0, 10\)/g,
      "joinDate: updatedEmp.hireDate || updatedEmp.joinDate || ''"
    );
    content = content.replace(
      /hireDate: \(updatedEmp\.hireDate \|\| updatedEmp\.joinDate \|\| '2026-01-01'\)\.slice\(0, 10\)/g,
      "hireDate: updatedEmp.hireDate || updatedEmp.joinDate || ''"
    );
  }
  
  if (file === 'src/components/OdooEmployeesDirectoryApp.tsx') {
    content = content.replace(
      /joinDate: emp\.joinDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g,
      "joinDate: emp.joinDate || ''"
    );
  }

  fs.writeFileSync(file, content);
}

// Check CommencementApp.tsx for actualJoiningDate defaults when generating commencement:
let commFile = 'src/apps/CommencementApp.tsx';
let commContent = fs.readFileSync(commFile, 'utf8');
commContent = commContent.replace(
  /setActualJoiningDate\(emp\.joinDate\);/g,
  "setActualJoiningDate(emp.joinDate || '');"
);
commContent = commContent.replace(
  /setActualJoiningDate\(comm\.actualJoiningDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  "setActualJoiningDate(comm.actualJoiningDate || '');"
);
fs.writeFileSync(commFile, commContent);

