import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `          onSwitchToApps={() => {
            const adminComp = companies.find(c => c.id === 'comp-super-admin') || companies[0];
            setActiveCompany(adminComp);
            setPortalViewMode('apps');
          }}`;

const newLogic = `          onSwitchToApps={() => {
            const adminComp = companies.find(c => c.id === 'comp-super-admin') || ADMIN_DEFAULT_COMPANY;
            localStorage.setItem('activeCompanyId', adminComp.id);
            setActiveCompany(adminComp);
            setPortalViewMode('apps');
          }}`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched onSwitchToApps logic successfully');
