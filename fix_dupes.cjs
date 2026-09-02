const fs = require('fs');
let code = fs.readFileSync('src/components/OdooAttendanceApp.tsx', 'utf8');

// replace "import { Fingerprint, Printer, Camera, " with "import { Fingerprint, "
code = code.replace(/import { Fingerprint, Printer, Camera, /g, 'import { Fingerprint, ');

fs.writeFileSync('src/components/OdooAttendanceApp.tsx', code, 'utf8');
console.log("Fixed dupes");
