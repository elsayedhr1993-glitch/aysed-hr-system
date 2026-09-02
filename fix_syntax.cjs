const fs = require('fs');
let content = fs.readFileSync('src/components/DeveloperSuite.tsx', 'utf8');

// Unescape backticks and dollar signs
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/DeveloperSuite.tsx', content, 'utf8');
