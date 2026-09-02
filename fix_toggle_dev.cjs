const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetToggle = `    const toggleDevMode = () => {
    setIsDevMode((prev) => {
      const next = !prev;
      localStorage.setItem('aysed_dev_mode', String(next));
      if (next) {
        setActiveTopApp('dev_tools');
        setActiveChildView('dev_console');
      } else {
        setActiveTopApp('hr');
        setActiveChildView('emp_list');
      }
      return next;
    });
  };`;

const newToggle = `  const toggleDevMode = () => {
    const next = !isDevMode;
    setIsDevMode(next);
    localStorage.setItem('aysed_dev_mode', String(next));
    if (next) {
      setActiveTopApp('dev_tools');
      setActiveChildView('dev_console');
    } else {
      setActiveTopApp('hr');
      setActiveChildView('emp_list');
    }
  };`;

if (content.includes(targetToggle)) {
  content = content.replace(targetToggle, newToggle);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find target toggle block.');
}
