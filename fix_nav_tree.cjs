const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const devToolsObj = `,
    dev_tools: {
      parentTitle: 'أدوات المطورين والتهيئة',
      children: [
        { id: 'dev_console', label: 'لوحة الفحص والتهيئة الفنية (Developer Mode)', icon: Terminal }
      ]
    }`;

content = content.replace(devToolsObj, '');
content = content.replace(`'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates' | 'dev_tools'`, `'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates'`);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Nav tree updated');
