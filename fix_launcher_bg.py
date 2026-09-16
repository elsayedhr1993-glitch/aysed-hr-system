import re

with open('src/components/OdooAppLauncher.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('dashboard-container bg-[#f8fafc]', 'dashboard-container w-full h-full bg-transparent')

with open('src/components/OdooAppLauncher.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

