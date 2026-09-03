with open('src/components/OdooCompanyDocsApp.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("status: doc.status === 'expired' ? 'overdue' : 'planned'", "status: doc.status === 'expired' ? 'red' : 'yellow'")

with open('src/components/OdooCompanyDocsApp.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
