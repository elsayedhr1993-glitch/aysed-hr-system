const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove duplicate imports
code = code.replace(/import { OdooAttendanceApp } from '\.\/components\/OdooAttendanceApp';\nimport { OdooAttendanceApp } from '\.\/components\/OdooAttendanceApp';/g, "import { OdooAttendanceApp } from './components/OdooAttendanceApp';");

// Remove duplicate lines in render
code = code.replace(/{activeChildView === 'attendance_log' && <OdooAttendanceApp \/>}\n          {activeChildView === 'attendance_log' && <OdooAttendanceApp \/>}\n          {activeChildView === 'attendance_log' && <OdooAttendanceApp \/>}/g, "{activeChildView === 'attendance_log' && <OdooAttendanceApp />}");

fs.writeFileSync('src/App.tsx', code, 'utf8');
