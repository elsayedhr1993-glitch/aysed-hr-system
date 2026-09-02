const fs = require('fs');
let code = fs.readFileSync('src/components/OdooEmployeesFull.tsx', 'utf8');

code = code.replace(
  /residencyExpiry: string;\n  passportExpiry: string;/g,
  `residencyExpiry: string;\n  civilIdExpiry?: string;\n  mohLicenseExpiry?: string;\n  passportExpiry: string;`
);

fs.writeFileSync('src/components/OdooEmployeesFull.tsx', code, 'utf8');
console.log("Fixed local types");
