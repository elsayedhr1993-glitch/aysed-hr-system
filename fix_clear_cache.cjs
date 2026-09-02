const fs = require('fs');
let content = fs.readFileSync('src/components/DeveloperSuite.tsx', 'utf8');

const targetStr = `  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }, 400);
  };`;

const newStr = `  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      // 1. حفظ بيانات الجلسة الحالية
      const authSession = localStorage.getItem('aysed_hr_auth');
      const currentUser = localStorage.getItem('current_user');
      
      // اضافة حفظ للشركات حتى لا تعود البيانات الوهمية
      const registeredCompanies = localStorage.getItem('aysed_registered_companies_live');
      const activeCompanyId = localStorage.getItem('activeCompanyId');
      const devMode = localStorage.getItem('aysed_dev_mode'); // عشان ما يقفل وضع المطور بعد الـ reload

      // 2. تفريغ الكاش والبيانات المؤقتة القديمة
      localStorage.clear();
      sessionStorage.clear();

      // 3. إعادة استرجاع الجلسة
      if (authSession) localStorage.setItem('aysed_hr_auth', authSession);
      if (currentUser) localStorage.setItem('current_user', currentUser);
      if (registeredCompanies) localStorage.setItem('aysed_registered_companies_live', registeredCompanies);
      if (activeCompanyId) localStorage.setItem('activeCompanyId', activeCompanyId);
      if (devMode) localStorage.setItem('aysed_dev_mode', devMode);

      // 4. إعادة تحميل الواجهة بسلاسة
      window.location.reload();
    }, 400);
  };`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/DeveloperSuite.tsx', content, 'utf8');
