const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldToggle = `  const toggleDevMode = () => {
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

const newToggle = `  const toggleDevMode = () => {
    const next = !isDevMode;
    if (next) {
      handleTopAppSwitch('dev_tools');
    } else {
      handleTopAppSwitch('hr');
    }
  };`;

if (content.includes(oldToggle)) {
  content = content.replace(oldToggle, newToggle);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find old toggle string.');
}
