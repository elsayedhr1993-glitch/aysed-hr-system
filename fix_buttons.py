import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = """                                <button 
                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف شركة (${comp.nameAr}) نهائياً؟`)) {
                                      const deletePromise = deleteCompany(comp.id);
                                      toast.promise(deletePromise, {
                                        loading: 'جاري حذف الشركة...',
                                        success: `تم حذف الشركة بنجاح`,
                                        error: (err) => `فشل حذف الشركة: ${err.message}`
                                      });
                                    }
                                  }}
                                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                                  title="حذف المشترك"
                                >"""

replacement = """                                <button 
                                  onClick={() => {
                                    impersonateCompany(comp.id);
                                    toast.success(`أنت الآن تتصفح بيانات شركة ${comp.nameAr}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm border border-transparent cursor-pointer ${
                                    isCurrentActive 
                                      ? 'bg-amber-500 text-slate-950 font-black' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <span>{isCurrentActive ? '✓ الجلسة نشطة' : 'دخول كمسؤول'}</span>
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف شركة (${comp.nameAr}) نهائياً؟`)) {
                                      const deletePromise = deleteCompany(comp.id);
                                      toast.promise(deletePromise, {
                                        loading: 'جاري حذف الشركة...',
                                        success: `تم حذف الشركة بنجاح`,
                                        error: (err) => `فشل حذف الشركة: ${err.message}`
                                      });
                                    }
                                  }}
                                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                                  title="حذف المشترك"
                                >"""

code = code.replace(target, replacement)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
