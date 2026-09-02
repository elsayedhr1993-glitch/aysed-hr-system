const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const earlyReturnStr = `  if (!isAuthenticated) {
    return <OdooLoginPage onLoginSuccess={() => {
      setIsAuthenticated(true);
      login('token_active_' + Date.now(), { id: 1, name: 'Admin', email: 'admin@almanar-clinic.com', role: 'admin' });
    }} />;
  }`;

content = content.replace(earlyReturnStr, '');

const returnStr = `  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans dir-rtl text-right text-slate-800" dir="rtl">`;

content = content.replace(returnStr, earlyReturnStr + '\n\n' + returnStr);

fs.writeFileSync('src/App.tsx', content, 'utf8');
