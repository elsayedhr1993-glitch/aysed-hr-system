import re

def fix_x_icon(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Check if X is used but not imported
    if "<X " in code and "import {" in code and " X " not in code and " X," not in code:
        code = re.sub(r'import {([^}]+)} from \'lucide-react\';', r'import {\1, X} from \'lucide-react\';', code)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)

fix_x_icon('src/components/OdooPayrollApp.tsx')
fix_x_icon('src/components/OdooPlanningApp.tsx')

def fix_company_docs():
    filepath = 'src/components/OdooCompanyDocsApp.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    code = code.replace('status: "overdue"', 'status: "red"')
    code = code.replace('status: "planned"', 'status: "yellow"')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)

fix_company_docs()
