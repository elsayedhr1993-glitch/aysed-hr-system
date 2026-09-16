import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the adminComp definition
code = code.replace(
  "const adminComp = companies.find(c => c.id === 'comp-super-admin') || ADMIN_DEFAULT_COMPANY;",
  "const adminComp = ADMIN_DEFAULT_COMPANY;"
);

// Fix the logic order in the useEffect
const oldLogic = `        const storedId = localStorage.getItem('activeCompanyId');
        if (storedId === 'comp-super-admin') {
          return adminComp;
        }
        if (storedId) {
          const found = companies.find(c => c.id === storedId);
          if (found) return found;
        }

        if (currentUserRole === 'SUPER_ADMIN') {
          localStorage.setItem('activeCompanyId', adminComp.id);
          return adminComp;
        }`;

const newLogic = `        const storedId = localStorage.getItem('activeCompanyId');

        // FORCE SUPER ADMIN REGARDLESS OF STORED ID
        if (currentUserRole === 'SUPER_ADMIN') {
          localStorage.setItem('activeCompanyId', adminComp.id);
          return adminComp;
        }

        if (storedId === 'comp-super-admin') {
          return adminComp;
        }
        if (storedId) {
          const found = companies.find(c => c.id === storedId);
          if (found) return found;
        }`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx successfully');
