const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/{activeChildView === 'leaves_mgmt'.*/g, 
  `{activeChildView === 'leaves_mgmt' && <OdooTimeOffApp />}
          {activeChildView === 'attendance_log' && <OdooAttendanceApp />}`);
          
code = code.replace(/{activeChildView === 'attendance_log'.*/g, 
  `{activeChildView === 'attendance_log' && <OdooAttendanceApp />}`);

code = code.replace(/import { OdooTimeOffApp } from '\.\/components\/OdooTimeOffApp';.*/g,
  `import { OdooTimeOffApp } from './components/OdooTimeOffApp';
import { OdooAttendanceApp } from './components/OdooAttendanceApp';`);

fs.writeFileSync('src/App.tsx', code, 'utf8');
