const fs = require('fs');
let code = fs.readFileSync('src/components/OdooAttendanceApp.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/OdooAttendanceApp.tsx', code, 'utf8');
console.log("Fixed strings");
