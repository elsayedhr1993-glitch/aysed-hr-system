import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

print("OdooLoginPage" in code)
