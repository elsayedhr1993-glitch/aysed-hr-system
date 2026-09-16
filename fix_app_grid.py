import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_grid = """            {/* شبكة الأيقونات الـ 11 المتناسقة */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto px-4 mt-4">
              {filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div 
                    key={app.id} 
                    onClick={() => {
                      setActiveApp(app.id as AppId);
                      setSearchQuery('');
                    }}
                    className="flex flex-col items-center cursor-pointer group w-28 text-center"
                  >
                    <div className={`w-20 h-20 md:w-22 md:h-22 ${app.color} rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl group-hover:scale-110 group-hover:shadow-2xl group-active:scale-95 transition-all duration-200 border border-white/20`}>
                      <IconComponent size={36} />
                    </div>
                    <span className="text-xs md:text-sm text-slate-100 mt-3 text-center font-bold leading-tight group-hover:text-amber-300 transition-colors">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight font-sans">
                      {app.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>"""

new_grid = """            {/* شبكة الأيقونات الـ 11 المتناسقة (Odoo Enterprise Design) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-10 max-w-5xl mx-auto px-4 mt-8 justify-items-center">
              {filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <button 
                    key={app.id} 
                    onClick={() => {
                      setActiveApp(app.id as AppId);
                      setSearchQuery('');
                    }}
                    className="flex flex-col items-center cursor-pointer group focus:outline-none w-[90px] sm:w-[100px]"
                  >
                    <div className={`relative w-[76px] h-[76px] sm:w-[86px] sm:h-[86px] ${app.color} rounded-2xl flex items-center justify-center shadow-md shadow-black/5 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 bg-gradient-to-br from-white/10 to-black/10 ring-1 ring-black/5`}>
                      <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-700 group-hover:text-slate-900 text-xs sm:text-[13px] text-center leading-tight tracking-wide">
                      {app.name}
                    </h3>
                  </button>
                );
              })}
            </div>"""

if old_grid in code:
    code = code.replace(old_grid, new_grid)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

