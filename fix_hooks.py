import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

guard = """  // Authentication Guard (Gateway)
  if (!user) {
    return <OdooLoginPage />;
  }
"""

code = code.replace(guard, "")
code = code.replace("  return (\n    <div className=\"h-screen", guard + "\n  return (\n    <div className=\"h-screen")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
