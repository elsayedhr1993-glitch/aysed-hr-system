const fs = require('fs');
let content = fs.readFileSync('src/components/OdooEmployeesFull.tsx', 'utf8');

if (!content.includes('OdooChatter')) {
  // Import OdooChatter
  content = content.replace(
    `import { Employee } from '../types';`,
    `import { Employee } from '../types';\nimport { OdooChatter } from './OdooChatter';`
  );

  // Add chatter after the form
  const searchPattern = `          </div>\n        </div>\n      ) : (\n        /* KANBAN / LIST VIEW */`;
  const replacePattern = `          </div>\n\n          {/* Chatter Component */}\n          <div className="-mx-6 -mb-6">\n            <OdooChatter \n              recordId={selectedEmployee.id} \n              model="employee" \n              followers={[{id: '1', name: 'أحمد الكندري (مدير)'}]}\n              messages={[\n                { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم إنشاء سجل الموظف' }\n              ]}\n            />\n          </div>\n\n        </div>\n      ) : (\n        /* KANBAN / LIST VIEW */`;
  
  if (content.includes(searchPattern)) {
    content = content.replace(searchPattern, replacePattern);
    fs.writeFileSync('src/components/OdooEmployeesFull.tsx', content, 'utf8');
    console.log('OdooChatter added to OdooEmployeesFull.tsx');
  } else {
    console.log('Search pattern not found in OdooEmployeesFull.tsx');
  }
}
