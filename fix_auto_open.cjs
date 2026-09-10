const fs = require('fs');
let content = fs.readFileSync('src/apps/EmployeesApp.tsx', 'utf8');

content = content.replace(
  /        return nextList;\n\s*\}\);\n\s*\} else \{/g,
  `        return nextList;
      });
      setSelectedEmployee(newEmp);
      setActiveTab('directory');
    } else {`
);

fs.writeFileSync('src/apps/EmployeesApp.tsx', content, 'utf8');
console.log('Fixed auto open');
