const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace("window.location.reload();", "");
fs.writeFileSync('src/App.tsx', content, 'utf8');
