const fs = require('fs');
let content = fs.readFileSync('./src/components/employees/tabs/EmployeeDocumentsTab.tsx', 'utf8');

content = content.replace("isOpen: boolean; url: string; title: string", "isOpen: boolean; url: string; title: string; fileType?: string");
content = content.replace("isOpen: false, url: '', title: ''", "isOpen: false, url: '', title: '', fileType: ''");
// there's a couple of them in the onClick handlers for closing
content = content.replace(/setPreviewModal\(\{ isOpen: false, url: '', title: '' \}\)/g, "setPreviewModal({ isOpen: false, url: '', title: '', fileType: '' })");

fs.writeFileSync('./src/components/employees/tabs/EmployeeDocumentsTab.tsx', content);
console.log("Fixed preview type");
