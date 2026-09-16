import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add isLoading
code = code.replace("const { logout, user } = useAuth();", "const { logout, user, isLoading } = useAuth();")

# Handle loading screen
guard = """  // Authentication Guard (Gateway)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center font-sans">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#714B67] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">جاري التحقق من الهوية...</p>
      </div>
    );
  }

  if (!user) {
    return <OdooLoginPage />;
  }
"""

code = re.sub(r'  // Authentication Guard \(Gateway\)\n  if \(\!user\) \{\n    return <OdooLoginPage />;\n  \}\n', guard, code)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
