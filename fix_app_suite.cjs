const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRender = `<DeveloperSuite onDisableDevMode={disableDevMode} />`;
const newRender = `<DeveloperSuite isDevMode={isDevMode} toggleDevMode={toggleDevMode} />`;

if (content.includes(oldRender)) {
  content = content.replace(oldRender, newRender);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx rendering updated successfully.');
} else {
  console.log('Could not find old render string in App.tsx.');
}
