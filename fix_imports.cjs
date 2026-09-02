const fs = require('fs');
let code = fs.readFileSync('src/components/OdooAttendanceApp.tsx', 'utf8');

code = code.replace(/import { Fingerprint, /g, 'import { Fingerprint, Printer, Camera, ');

fs.writeFileSync('src/components/OdooAttendanceApp.tsx', code, 'utf8');
console.log("Fixed imports");
