const fs = require('fs');
let content = fs.readFileSync('src/components/OdooEmployeesDirectoryApp.tsx', 'utf8');

content = content.replace(
  /if \(activeCompanyId === 'comp-super-admin'\) \{\n\s*return true;\n\s*\}\n\s*return empComp === activeCompanyId;/g,
  `if (activeCompanyId === 'comp-super-admin' || !activeCompanyId) {\n      return true;\n    }\n    return empComp === activeCompanyId;`
);

fs.writeFileSync('src/components/OdooEmployeesDirectoryApp.tsx', content, 'utf8');
console.log('Fixed filter 2');
