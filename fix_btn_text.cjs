const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<span className="hidden lg:inline">إيقاف وضع المطور<\/span>/g, '<span>إيقاف وضع المطور</span>');
content = content.replace(/<span className="hidden lg:inline">تشغيل وضع المطور<\/span>/g, '<span>تشغيل وضع المطور</span>');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed button text visibility.');
