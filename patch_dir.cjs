const fs = require('fs');
let code = fs.readFileSync('src/components/OdooEmployeesDirectoryApp.tsx', 'utf8');

code = code.replace(/setPersistentData\(MANARA_STORAGE_KEYS\.EMPLOYEES, updated\);/g, "localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(updated));");

fs.writeFileSync('src/components/OdooEmployeesDirectoryApp.tsx', code);
console.log('Patched OdooEmployeesDirectoryApp.tsx');
