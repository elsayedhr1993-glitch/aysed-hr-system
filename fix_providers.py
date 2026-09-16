import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_app = """export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <OdooHierarchyProvider>
          <MainAppLayout />
        </OdooHierarchyProvider>
      </TenantProvider>
    </AuthProvider>
  );
}"""

code = re.sub(r'export default function App\(\) \{.*?\n\}', new_app, code, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
