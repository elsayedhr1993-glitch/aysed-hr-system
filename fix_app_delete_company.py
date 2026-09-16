import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_click = """                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف شركة (${comp.nameAr}) نهائياً؟`)) {
                                      const deletePromise = deleteCompany(comp.id);
                                      toast.promise(deletePromise, {
                                        loading: 'جاري حذف الشركة...',
                                        success: `تم حذف الشركة بنجاح`,
                                        error: (err) => `فشل حذف الشركة: ${err.message}`
                                      });
                                    }
                                  }}"""

code = re.sub(r'                                  onClick=\{.*? \}\n                                  \}\}', new_click, code, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
