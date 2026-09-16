import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add saas_admin view
if "activeApp === 'saas_admin'" not in code:
    saas_admin_block = """        {/* الحالة 13: السوبر أدمن */}
        {activeApp === 'saas_admin' && (
          <main className="flex-1 overflow-y-auto w-full">
            <SuperAdminDashboard />
          </main>
        )}
"""
    # Insert it before the end of the strict single-view canvas
    code = code.replace("      </div>\n    </div>\n  );\n}\n", saas_admin_block + "      </div>\n    </div>\n  );\n}\n")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
