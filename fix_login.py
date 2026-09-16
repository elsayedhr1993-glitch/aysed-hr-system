import re

with open('src/components/OdooLoginPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add firebase imports
if "signInWithEmailAndPassword" not in code:
    code = code.replace(
        "import { useAuth } from '../context/AuthContext';",
        "import { useAuth } from '../context/AuthContext';\nimport { signInWithEmailAndPassword } from 'firebase/auth';\nimport { auth } from '../lib/firebase';"
    )

# Replace the submission handler
new_handler = """  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // نجاح الدخول - تصفير عداد الأخطاء
      setFailedAttempts(0);
      
      // AuthContext will automatically detect the state change and hide the login page.
    } catch (error: any) {
      console.error("Login Error:", error);
      
      // فشل الدخول - تطبيق الجدار الناري
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTime(30);
        setErrorMsg('تم حظر الوصول مؤقتاً لمدة 30 ثانية بسبب محاولات متكررة خاطئة.');
      } else {
        // Translate common Firebase errors
        let friendlyError = 'بيانات الدخول غير صحيحة';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          friendlyError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.code === 'auth/too-many-requests') {
          friendlyError = 'محاولات متكررة. تم حظر الحساب مؤقتاً.';
        }
        
        setErrorMsg(`${friendlyError} (متبقي ${5 - newAttempts} محاولات)`);
      }
    } finally {
      setIsLoading(false);
    }
  };"""

code = re.sub(r'  const handleLoginSubmit = \(e: React.FormEvent\) => \{.*?(?=  return \()', new_handler + "\n\n", code, flags=re.DOTALL)

with open('src/components/OdooLoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
