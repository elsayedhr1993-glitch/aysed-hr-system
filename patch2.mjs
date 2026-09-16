import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `        const storedId = localStorage.getItem('activeCompanyId');

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

const newLogic = `        const storedId = localStorage.getItem('activeCompanyId');

        if (currentUserRole === 'SUPER_ADMIN') {
          // If a super admin explicitly impersonates someone, storedId will be that company's ID.
          // We should respect it, but if it's missing, default to adminComp.
          if (storedId && storedId !== 'comp-super-admin') {
            const found = companies.find(c => c.id === storedId);
            if (found) return found;
          }
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
console.log('Patched impersonation logic successfully');
