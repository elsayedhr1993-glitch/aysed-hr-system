const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetDisable = `  const disableDevMode = () => {
    setIsDevMode(false);
    localStorage.setItem('aysed_dev_mode', 'false');
    setActiveTopApp('hr');
    setActiveChildView('emp_list');
  };`;

const newDisable = `  const disableDevMode = () => {
    setIsDevMode(false);
    localStorage.removeItem('aysed_dev_mode');
    setActiveTopApp('hr');
    setActiveChildView('emp_list');
  };

  // إغلاق وضع المطور تلقائياً عند أول تحميل للتطبيق
  useEffect(() => {
    localStorage.removeItem('aysed_dev_mode');
  }, []);`;

if (content.includes(targetDisable)) {
  content = content.replace(targetDisable, newDisable);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find target disableDevMode block.');
}
