const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace("if (!window.confirm('هل أنت متأكد من تسجيل الخروج؟')) return;", "");
fs.writeFileSync('src/App.tsx', content, 'utf8');
