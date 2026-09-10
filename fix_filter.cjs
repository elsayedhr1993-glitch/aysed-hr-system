const fs = require('fs');
let content = fs.readFileSync('src/apps/EmployeesApp.tsx', 'utf8');

content = content.replace(
  /const visibleEmployees = employees\.filter\(emp => \{\n\s*const empCompanyId = emp\.companyId \|\| \(emp as any\)\.company_id;\n\s*if \(activeCompanyId === 'comp-super-admin'\) \{\n\s*return true;\n\s*\}\n\s*return empCompanyId === activeCompanyId;\n\s*\}\);/g,
  `const visibleEmployees = employees.filter(emp => {
    const empCompanyId = emp.companyId || (emp as any).company_id;
    if (currentCompanyId === 'comp-super-admin' || !currentCompanyId) {
      return true;
    }
    return empCompanyId === currentCompanyId;
  });`
);

fs.writeFileSync('src/apps/EmployeesApp.tsx', content, 'utf8');
console.log('Fixed filter');
