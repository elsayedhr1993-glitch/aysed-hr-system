import re

with open('src/components/OdooAppLauncher.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = "      {/* 🔴 Dafthra-Style Top Ticker Bar */}"
end_marker = "      {/* 📊 Dafthra-Style Compact Charts Section */}"

if start_marker in code and end_marker in code:
    before = code.split(start_marker)[0]
    after = code.split(end_marker)[1]
    
    new_grid = """      {/* 🧩 Odoo Enterprise App Switcher Grid */}
      <div className="w-full max-w-5xl mx-auto py-8 lg:py-16">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-10 justify-items-center">
          {apps.filter((app) => {
            if (currentUserRole === 'EMPLOYEE') {
              return ['ATTENDANCE', 'LEAVES', 'DOCUMENTS'].includes(app.id);
            }
            return true;
          }).map((app) => {
            const IconComponent = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => onSelectApp(app.id)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none w-[90px] sm:w-[100px]"
              >
                <div className={`relative w-[76px] h-[76px] sm:w-[86px] sm:h-[86px] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 transform group-hover:-translate-y-1 ${app.iconBg} bg-gradient-to-br from-white/10 to-black/10 ring-1 ring-black/5`}>
                  <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-sm" strokeWidth={1.5} />
                  {app.badge && app.badge !== '0' && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#f8fafc] shadow-sm">
                      {app.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-slate-700 group-hover:text-slate-900 text-xs sm:text-[13px] text-center leading-tight tracking-wide">
                  {app.titleAr}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

"""
    code = before + new_grid + "      {/* 📊 Odoo-Style Compact Charts Section */}\n" + after

with open('src/components/OdooAppLauncher.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

