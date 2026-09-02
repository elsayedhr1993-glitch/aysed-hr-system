const fs = require('fs');

// For OdooContractsApp.tsx
let contentContracts = fs.readFileSync('src/components/OdooContractsApp.tsx', 'utf8');
if (!contentContracts.includes('OdooChatter')) {
  contentContracts = contentContracts.replace(
    `import { useOdooHierarchy } from '../context/OdooHierarchyContext';`,
    `import { useOdooHierarchy } from '../context/OdooHierarchyContext';\nimport { OdooChatter } from './OdooChatter';`
  );
  
  const searchPattern = `    </div>\n  );\n};\n`;
  const replacePattern = `\n      {/* Chatter Component */}\n      <div className="mt-8">\n        <OdooChatter \n          recordId="contracts_global" \n          model="contract" \n          followers={[{id: '2', name: 'مدير الموارد البشرية'}]}\n          messages={[\n            { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم تحديث رواتب الموظفين بنجاح' }\n          ]}\n        />\n      </div>\n    </div>\n  );\n};\n`;
  
  if (contentContracts.includes('    </div>\n  );\n};\n')) {
    contentContracts = contentContracts.replace('    </div>\n  );\n};\n', replacePattern);
    fs.writeFileSync('src/components/OdooContractsApp.tsx', contentContracts, 'utf8');
    console.log('Added to OdooContractsApp');
  } else if (contentContracts.includes('    </div>\n  );\n}')) {
    contentContracts = contentContracts.replace('    </div>\n  );\n}', replacePattern.replace('};\n', '}') );
    fs.writeFileSync('src/components/OdooContractsApp.tsx', contentContracts, 'utf8');
    console.log('Added to OdooContractsApp');
  }
}

// For OdooOperationsApp.tsx
let contentOps = fs.readFileSync('src/components/OdooOperationsApp.tsx', 'utf8');
if (!contentOps.includes('OdooChatter')) {
  contentOps = contentOps.replace(
    `import { useCompany } from '../context/CompanyContext';`,
    `import { useCompany } from '../context/CompanyContext';\nimport { OdooChatter } from './OdooChatter';`
  );
  
  const replacePatternOps = `\n      {/* Chatter Component */}\n      <div className="mt-8">\n        <OdooChatter \n          recordId="operations_global" \n          model="operations" \n          followers={[{id: '3', name: 'مدير الشؤون الإدارية'}]}\n          messages={[\n            { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم تسجيل العهد والسلف الجديدة' }\n          ]}\n        />\n      </div>\n    </div>\n  );\n};\n`;
  
  if (contentOps.includes('    </div>\n  );\n};\n')) {
    contentOps = contentOps.replace('    </div>\n  );\n};\n', replacePatternOps);
    fs.writeFileSync('src/components/OdooOperationsApp.tsx', contentOps, 'utf8');
    console.log('Added to OdooOperationsApp');
  } else if (contentOps.includes('    </div>\n  );\n}')) {
    contentOps = contentOps.replace('    </div>\n  );\n}', replacePatternOps.replace('};\n', '}'));
    fs.writeFileSync('src/components/OdooOperationsApp.tsx', contentOps, 'utf8');
    console.log('Added to OdooOperationsApp');
  }
}
