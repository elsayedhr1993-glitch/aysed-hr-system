const fs = require('fs');
let content = fs.readFileSync('./src/components/employees/OdooEmployeeDetailView.tsx', 'utf8');

const imports = `import { EmployeeWorkTab } from './tabs/EmployeeWorkTab';
import { EmployeePrivateTab } from './tabs/EmployeePrivateTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';`;

if (!content.includes('EmployeeWorkTab')) {
    content = content.replace("import { EditableField, EditableSelect } from '../EditableField';", 
    "import { EditableField, EditableSelect } from '../EditableField';\n" + imports);
}

fs.writeFileSync('./src/components/employees/OdooEmployeeDetailView.tsx', content);
console.log("Fixed imports");
