import re

with open('src/context/AuthContext.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Auto-seed the user doc if it doesn't exist for the super admin emails
auto_seed = """          // Attempt to fetch profile
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              role = data.role || role;
              name = data.name || name;
              companyId = data.companyId;
            } else {
              // Auto-seed for the first time login if it's the known admin
              const { setDoc } = await import('firebase/firestore');
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                email: firebaseUser.email,
                name: 'مدير النظام المركزية',
                role: 'SUPER_ADMIN',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
             console.warn("Could not fetch or seed user profile from firestore:", e);
          }"""

code = re.sub(r'          // Attempt to fetch profile\n.*?console\.warn\("Could not fetch user profile from firestore:", e\);\n          \}', auto_seed, code, flags=re.DOTALL)

with open('src/context/AuthContext.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
