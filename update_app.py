import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add showUserMenu state
if 'const [showUserMenu, setShowUserMenu] = useState(false);' not in code:
    code = code.replace(
        'const [debugMode, setDebugMode] = useState(false);',
        'const [debugMode, setDebugMode] = useState(false);\n  const [showUserMenu, setShowUserMenu] = useState(false);'
    )

# 2. Add an import for UserCircle if not present
if 'UserCircle' not in code:
    code = code.replace('Building,', 'Building,\n  UserCircle,\n  Settings,')
    code = code.replace('Settings,', 'Settings,\n  Shield,')

# 3. Re-write the header
header_start = code.find('{/* الشريط العلوي النحيف الموحد')
header_end = code.find('</header>') + len('</header>')

new_header = """      {/* الشريط العلوي النحيف الموحد (Odoo Enterprise Navbar) */}
      <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-4 z-40 select-none shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveApp('switcher')} 
            className={`p-1.5 hover:bg-white/20 rounded-md transition text-lg font-bold flex items-center justify-center cursor-pointer ${
              activeApp === 'switcher' ? 'bg-white/25 shadow-inner' : ''
            }`}
            title="العودة لشبكة التطبيقات الرئيسية"
          >
            <span className="leading-none text-xl">▦</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
              {activeApp === 'switcher' ? 'Aysed HR S 2026' : getActiveAppTitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* توقيت الكويت */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-mono text-white/90">
            <Clock size={14} className="text-white/70" />
            <span>{kuwaitTime}</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold border border-white/30">
                <UserCircle size={18} />
              </div>
              <span className="text-xs font-medium hidden md:block max-w-[120px] truncate">
                {activeCompany ? activeCompany.nameAr : 'النظام المركزي'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-800">{currentUserEmail || 'admin@aysed.com'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{activeCompany ? activeCompany.nameAr : 'مدير النظام (Super Admin)'}</p>
                </div>
                
                {isSuperAdmin && (
                  <>
                    <button 
                      onClick={() => { setActiveApp('settings'); setShowUserMenu(false); }}
                      className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2 cursor-pointer"
                    >
                      <Layers size={14} /> بوابة المشتركين (SaaS)
                    </button>
                    <button 
                      onClick={() => { setActiveApp('saas_admin'); setShowUserMenu(false); }}
                      className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2 cursor-pointer"
                    >
                      <Shield size={14} /> لوحة التحكم المركزية
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                  </>
                )}

                <button 
                  onClick={() => { setDebugMode(!debugMode); setShowUserMenu(false); }}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2 cursor-pointer"
                >
                  <Settings size={14} /> 
                  <span>وضع المطور التقني</span>
                  {debugMode && <span className="mr-auto w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>

                <div className="h-px bg-slate-100 my-1"></div>
                
                <button 
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>"""

if header_start != -1:
    code = code[:header_start] + new_header + code[header_end:]

# 4. Change switcher background gradient
old_bg_1 = "bg-gradient-to-b from-slate-900 via-[#111827] to-slate-950 flex flex-col items-center p-6 md:p-10 overflow-y-auto w-full"
new_bg_1 = "bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex flex-col items-center overflow-y-auto w-full relative"

if old_bg_1 in code:
    code = code.replace(old_bg_1, new_bg_1)

# Ensure to remove the search bar in switcher if it's there, Odoo 17 has no huge search bar on top of the dashboard. It has it clean.
# Actually I'll let the user decide. The search bar is useful.

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

