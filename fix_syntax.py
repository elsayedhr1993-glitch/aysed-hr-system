import re

for filepath in ['src/components/OdooPayrollApp.tsx', 'src/components/OdooPlanningApp.tsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    code = code.replace("\\'lucide-react\\'", "'lucide-react'")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
