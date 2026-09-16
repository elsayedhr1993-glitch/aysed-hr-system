import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_click = """                      onClick={async () => {
                        if (!newCompName.trim() || !newUsername.trim() || !newPassword.trim()) {
                          toast.error('يرجى تعبئة الحقول الإلزامية');
                          return;
                        }
                        
                        const addPromise = addCompany({
                          nameAr: newCompName,
                          nameEn: newCompName,
                          adminUsername: newUsername,
                          adminPassword: newPassword,
                          contactPhone: newPhone || '96590000000',
                          pamFileNumber: newPamNumber || 'PAM-000',
                          commercialReg: 'CR-1000',
                          mohLicense: 'MOH-000',
                          iban: 'KW0000000000000000000000',
                          bankName: 'بنك الكويت الوطني'
                        });

                        toast.promise(addPromise, {
                          loading: 'جاري تهيئة قاعدة بيانات الشركة وحساب المدير...',
                          success: () => {
                            setShowAddModal(false);
                            setNewCompName('');
                            setNewUsername('');
                            setNewPassword('');
                            setNewPamNumber('');
                            setNewPhone('');
                            return `تم إنشاء وتفعيل شركة (${newCompName}) بنجاح`;
                          },
                          error: (err) => `فشل إنشاء الشركة: ${err.message}`
                        });
                      }}"""

code = re.sub(r'                      onClick=\{.*? setShowAddModal\(false\);\n.*?setNewPhone\(''\);\n                      \}\}', new_click, code, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
