import fs from 'fs';

let topBar = fs.readFileSync('src/components/OdooTopBar.tsx', 'utf8');
topBar = topBar.replace(
  "{activeCompany?.name || activeCompany?.nameAr || 'المنشأة'}",
  "{activeCompany?.id === 'comp-super-admin' ? 'إدارة النظام المركزية' : (activeCompany?.name || activeCompany?.nameAr || 'المنشأة')}"
);
topBar = topBar.replace(
  "{activeCompany?.name || activeCompany?.nameAr || 'المنار كلينك'}",
  "{activeCompany?.id === 'comp-super-admin' ? 'إدارة النظام المركزية' : (activeCompany?.name || activeCompany?.nameAr || 'المنشأة')}"
);
fs.writeFileSync('src/components/OdooTopBar.tsx', topBar);

let appLauncher = fs.readFileSync('src/components/OdooAppLauncher.tsx', 'utf8');
appLauncher = appLauncher.replace(
  "المنشأة: {activeCompany?.nameAr || 'المنار كلينك'}",
  "المنشأة: {activeCompany?.id === 'comp-super-admin' ? 'إدارة النظام المركزية' : (activeCompany?.nameAr || 'المنشأة')}"
);
// Make sure it doesn't have the isSuperAdmin error
appLauncher = appLauncher.replace(
  "المنشأة: {isSuperAdmin ? 'إدارة النظام المركزية' : (activeCompany?.nameAr || 'المنشأة')}",
  "المنشأة: {activeCompany?.id === 'comp-super-admin' ? 'إدارة النظام المركزية' : (activeCompany?.nameAr || 'المنشأة')}"
);
fs.writeFileSync('src/components/OdooAppLauncher.tsx', appLauncher);

console.log('Fixed names');
