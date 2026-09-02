const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    return localStorage.getItem('aysed_dev_mode') === 'true';
  });`;
const newStr = `  const [isDevMode, setIsDevMode] = useState<boolean>(false);`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', content, 'utf8');
