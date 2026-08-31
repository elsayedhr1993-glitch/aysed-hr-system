const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `
        const storedId = localStorage.getItem('activeCompanyId');
        if (storedId === 'comp-super-admin') {
          return adminComp;
        }
        if (storedId) {
          const found = companies.find(c => c.id === storedId);
          if (found) return found;
        }

        if (currentUserRole === 'SUPER_ADMIN') {
`;

const replacement = `
        const storedId = localStorage.getItem('activeCompanyId');

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
        }

        if (currentUserRole === 'SUPER_ADMIN') { // keep to avoid syntax error if needed, but wait, let's just replace the whole block cleanly
`;

// actually let's use a regex replacement
