const fs = require('fs');
let code = fs.readFileSync('src/components/OdooEmployeesFull.tsx', 'utf8');

if (!code.includes('import { getExpiryStatus }')) {
  code = code.replace(
    /import { OdooChatter } from '\.\/OdooChatter';/,
    `import { OdooChatter, ChatterMessage } from './OdooChatter';\nimport { getExpiryStatus } from '../utils/expiryUtils';`
  );

  const searchPattern = `          {/* Chatter Component */}\n          <div className="-mx-6 -mb-6">\n            <OdooChatter \n              recordId={selectedEmployee.id} \n              model="employee" \n              followers={[{id: '1', name: 'أحمد الكندري (مدير)'}]}\n              messages={[\n                { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم إنشاء سجل الموظف' }\n              ]}\n            />\n          </div>`;
  
  const replacePattern = `          {/* Chatter Component */}\n          <div className="-mx-6 -mb-6">\n            {(() => {\n              const messages: ChatterMessage[] = [\n                { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم إنشاء سجل الموظف' }\n              ];\n\n              // Civil ID & Residency Expiry\n              const civilExpiry = getExpiryStatus(selectedEmployee.civilIdExpiry || selectedEmployee.residencyExpiry);\n              if (civilExpiry && civilExpiry.days <= 60) {\n                messages.push({\n                  id: 'auto-civil',\n                  author: 'نظام التنبيهات',\n                  date: new Date().toLocaleDateString('ar-KW'),\n                  content: \`يرجى تجديد الإقامة والبطاقة المدنية للموظف (\${selectedEmployee.name}).\`, \n                  type: 'activity',\n                  activityDetails: {\n                    type: 'تجديد مستند',\n                    assignee: 'يوسف العلي',\n                    dueDate: selectedEmployee.civilIdExpiry || selectedEmployee.residencyExpiry || '',\n                    status: civilExpiry.status,\n                    statusText: civilExpiry.text\n                  }\n                });\n              }\n\n              // MOH License Expiry (Medical)\n              const mohExpiry = getExpiryStatus(selectedEmployee.mohLicenseExpiry);\n              if (mohExpiry && mohExpiry.days <= 60) {\n                messages.push({\n                  id: 'auto-moh',\n                  author: 'نظام التنبيهات',\n                  date: new Date().toLocaleDateString('ar-KW'),\n                  content: \`يرجى تجديد ترخيص مزاولة المهنة الطبية (MOH) للموظف (\${selectedEmployee.name}).\`,\n                  type: 'activity',\n                  activityDetails: {\n                    type: 'تجديد ترخيص طبي',\n                    assignee: 'أحمد الكندري',\n                    dueDate: selectedEmployee.mohLicenseExpiry || '',\n                    status: mohExpiry.status,\n                    statusText: mohExpiry.text\n                  }\n                });\n              }\n\n              return (\n                <OdooChatter \n                  recordId={selectedEmployee.id} \n                  model="employee" \n                  followers={[\n                    {id: '1', name: 'أحمد الكندري (مدير)'},\n                    {id: '2', name: 'يوسف العلي (جوازات)'},\n                    {id: '3', name: 'محمد إبراهيم السيد (شؤون عاملين)'}\n                  ]}\n                  messages={messages}\n                />\n              );\n            })()}\n          </div>`;
              
  code = code.replace(searchPattern, replacePattern);
  fs.writeFileSync('src/components/OdooEmployeesFull.tsx', code, 'utf8');
  console.log("Patched OdooEmployeesFull.tsx successfully");
} else {
  console.log("Already patched");
}
