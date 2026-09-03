import re

with open('src/context/TenantContext.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("} , documentId, where } from 'firebase/firestore';", ", documentId, where } from 'firebase/firestore';")

with open('src/context/TenantContext.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
