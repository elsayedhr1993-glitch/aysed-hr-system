const fs = require('fs');
let code = fs.readFileSync('src/components/OdooMainDashboard.tsx', 'utf8');

code = code.replace(
  `  const allEmployees = getPersistentData<any[]>(MANARA_STORAGE_KEYS.EMPLOYEES, []);`,
  `  // Load real employees from partitioned persistent storage
  const currentCompanyId = activeCompany?.id || 'comp-super-admin';
  const rawEmployees = localStorage.getItem(\`odoo_employees_v1_\${currentCompanyId}\`);
  const allEmployees = rawEmployees ? JSON.parse(rawEmployees) : [];`
);

fs.writeFileSync('src/components/OdooMainDashboard.tsx', code);
console.log('Patched OdooMainDashboard.tsx');
