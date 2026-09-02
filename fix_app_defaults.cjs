const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetEffect = `  // إغلاق وضع المطور تلقائياً عند أول تحميل للتطبيق
  useEffect(() => {
    localStorage.removeItem('aysed_dev_mode');
  }, []);`;

const newEffect = `  // إغلاق وضع المطور وتوجيه العرض الافتراضي فوراً إلى واجهة الموظفين عند بدء التشغيل
  useEffect(() => {
    localStorage.removeItem('aysed_dev_mode');
    setIsDevMode(false);
    setActiveTopApp('hr');
    setActiveChildView('emp_list');
  }, []);`;

if (content.includes(targetEffect)) {
  content = content.replace(targetEffect, newEffect);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find target effect block.');
}
