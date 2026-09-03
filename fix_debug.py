import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if "OdooDebugMenu" not in code:
    code = code.replace("import { SuperAdminDashboard } from './pages/SuperAdminDashboard';", "import { SuperAdminDashboard } from './pages/SuperAdminDashboard';\nimport { OdooDebugMenu } from './components/OdooDebugMenu';")
    code = code.replace("      {/* حاوية العرض الصارمة", "      {debugMode && <OdooDebugMenu />}\n      {/* حاوية العرض الصارمة")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
