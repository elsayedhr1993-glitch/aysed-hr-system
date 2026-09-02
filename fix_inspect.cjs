const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "onClick={() => console.log('State:', { activeTopApp, activeChildView, historyStack })}",
  "onClick={() => { console.log('State:', { activeTopApp, activeChildView, historyStack }); setSaveStatus('تم طباعة الحالة في الـ Console (F12)'); setTimeout(() => setSaveStatus(null), 3000); }}"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
