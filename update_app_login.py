import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import if missing
if "OdooLoginPage" not in code:
    code = code.replace(
        "import { OdooDebugMenu } from './components/OdooDebugMenu';", 
        "import { OdooDebugMenu } from './components/OdooDebugMenu';\nimport OdooLoginPage from './components/OdooLoginPage';"
    )

# Add guard
guard_code = """
  const { logout, user } = useAuth();

  // Authentication Guard (Gateway)
  if (!user) {
    return <OdooLoginPage />;
  }
"""

if "// Authentication Guard (Gateway)" not in code:
    code = code.replace("  const { logout, user } = useAuth();\n", guard_code)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
