const fs = require('fs');

const filePath = 'src/components/OdooLoginPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace btoa(JSON.stringify(...)) with btoa(encodeURIComponent(JSON.stringify(...)))
content = content.replace(
  "btoa(JSON.stringify(sessionData))",
  "btoa(encodeURIComponent(JSON.stringify(sessionData)))"
);

fs.writeFileSync(filePath, content, 'utf8');
