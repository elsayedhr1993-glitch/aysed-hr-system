const fs = require('fs');
let code = fs.readFileSync('src/components/OdooCompanyDocsApp.tsx', 'utf8');

if (!code.includes('import { OdooChatter')) {
  code = code.replace(
    /import { useCompany } from '\.\.\/context\/CompanyContext';/,
    `import { useCompany } from '../context/CompanyContext';\nimport { OdooChatter, ChatterMessage } from './OdooChatter';\nimport { getExpiryStatus } from '../utils/expiryUtils';`
  );

  const endSearch = `          </table>\n        </div>\n      </div>\n    </div>\n  );\n};\n`;
  const endReplace = `          </table>\n        </div>\n      </div>\n\n      {/* Chatter Component for automated company doc expiry triggers */}\n      <div className="mt-8">\n        {(() => {\n          const messages: ChatterMessage[] = [];\n          docs.forEach(doc => {\n            const status = getExpiryStatus(doc.expiryDate);\n            if (status && status.days <= 60) {\n               messages.push({\n                  id: \`auto-doc-\${doc.id}\`,\n                  author: 'نظام التنبيهات (التراخيص)',\n                  date: new Date().toLocaleDateString('ar-KW'),\n                  content: \`يرجى تجديد (\${doc.docTitle}) للمنشأة. رقم المستند: \${doc.documentNumber}\`,\n                  type: 'activity',\n                  activityDetails: {\n                    type: 'تجديد مستند منشأة',\n                    assignee: doc.category === 'moh' || doc.category === 'fire' ? 'يوسف العلي' : 'يوسف العلي',\n                    dueDate: doc.expiryDate,\n                    status: status.status,\n                    statusText: status.text\n                  }\n               });\n            }\n          });\n          return (\n            <OdooChatter \n              recordId="company_docs_global" \n              model="company_docs" \n              followers={[{id: '1', name: 'أحمد الكندري'}, {id: '2', name: 'يوسف العلي'}]}\n              messages={messages}\n            />\n          );\n        })()}\n      </div>\n    </div>\n  );\n};\n`;

  if (code.includes('          </table>\n        </div>\n      </div>\n    </div>\n  );\n};\n')) {
     code = code.replace(endSearch, endReplace);
  } else if (code.includes('          </table>\n        </div>\n      </div>\n    </div>\n  );\n}')) {
     code = code.replace('          </table>\n        </div>\n      </div>\n    </div>\n  );\n}', endReplace.replace('};\n', '}'));
  }
  fs.writeFileSync('src/components/OdooCompanyDocsApp.tsx', code, 'utf8');
  console.log("Patched OdooCompanyDocsApp.tsx successfully");
}
