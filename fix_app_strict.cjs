const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetRender = `          {isDevMode && <DeveloperSuite onDisableDevMode={disableDevMode} />}`;
const newRender = `          {activeChildView === 'dev_console' && isDevMode && <DeveloperSuite onDisableDevMode={disableDevMode} />}`;

if (content.includes(targetRender)) {
  content = content.replace(targetRender, newRender);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find target render block.');
}
