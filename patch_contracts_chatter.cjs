const fs = require('fs');
let code = fs.readFileSync('src/components/OdooContractsApp.tsx', 'utf8');

if (!code.includes('import { getExpiryStatus }')) {
  code = code.replace(
    /import { OdooChatter } from '\.\/OdooChatter';/,
    `import { OdooChatter, ChatterMessage } from './OdooChatter';\nimport { getExpiryStatus } from '../utils/expiryUtils';`
  );

  const searchPattern = `      {/* Chatter Component */}\n      <div className="mt-8">\n        <OdooChatter \n          recordId="contracts_global" \n          model="contract" \n          followers={[{id: '2', name: 'مدير الموارد البشرية'}]}\n          messages={[\n            { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم تحديث رواتب الموظفين بنجاح' }\n          ]}\n        />\n      </div>`;

  const replacePattern = `      {/* Chatter Component */}\n      <div className="mt-8">\n        {(() => {\n           const messages: ChatterMessage[] = [];\n           employees.forEach(emp => {\n             if (emp.contractStatus === 'draft') {\n                messages.push({\n                  id: \`auto-contract-\${emp.id}\`,\n                  author: 'نظام العقود',\n                  date: new Date().toLocaleDateString('ar-KW'),\n                  content: \`يرجى مراجعة واعتماد مسودة العقد للموظف (\${emp.name}).\`,\n                  type: 'activity',\n                  activityDetails: {\n                    type: 'متابعة عقد',\n                    assignee: 'محمد إبراهيم السيد',\n                    dueDate: new Date().toISOString().split('T')[0],\n                    status: 'yellow',\n                    statusText: 'يستحق قريباً (مسودة)'\n                  }\n                });\n             }\n           });\n           return (\n             <OdooChatter \n               recordId="contracts_global" \n               model="contract" \n               followers={[{id: '1', name: 'محمد إبراهيم السيد (شؤون عاملين)'}, {id: '2', name: 'أحمد الكندري'}]}\n               messages={messages.length > 0 ? messages : [\n                 { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'جميع العقود سارية.' }\n               ]}\n             />\n           );\n        })()}\n      </div>`;

  code = code.replace(searchPattern, replacePattern);
  fs.writeFileSync('src/components/OdooContractsApp.tsx', code, 'utf8');
  console.log("Patched OdooContractsApp.tsx successfully");
}
