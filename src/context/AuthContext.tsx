import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, setPersistence, browserSessionPersistence, User as FirebaseUser } from 'firebase/auth';
import { auth, db, isTenantPurged } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string; // For tenant isolation
  photoURL?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isDebugMode: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  toggleDebugMode: () => void;
  updateAvatar: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inactivity timeout: 15 minutes (900,000 ms)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isDebugMode, setIsDebugMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === '1' || localStorage.getItem('aysed_debug') === 'true' || localStorage.getItem('odoo_debug_mode') === 'true';
  });

  // Enforce session-only persistence (Firebase Auth Session Firewall)
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch((err) => {
      console.warn('Could not set browserSessionPersistence:', err);
    });
  }, []);

  useEffect(() => {
    if (isDebugMode) {
      localStorage.setItem('aysed_debug', 'true');
      localStorage.setItem('odoo_debug_mode', 'true');
    } else {
      localStorage.removeItem('aysed_debug');
      localStorage.removeItem('odoo_debug_mode');
    }
  }, [isDebugMode]);

  // Auth Firewall State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userEmail = (firebaseUser.email || '').toLowerCase();

          // 1. Firewall check for purged/blacklisted tenant
          if (isTenantPurged(userEmail)) {
            await signOut(auth);
            setUser(null);
            setToken(null);
            toast.error('تم حظر الوصول: الحساب معطل أو ملغى بجدار حماية المنظومة.');
            setIsLoading(false);
            return;
          }

          // Fetch user role and company info from Firestore if needed
          const isSuper = ['admin@aysed.com', 'elsayedhr1993@gmail.com', 'admin@aysed-hr.com'].includes(userEmail);
          let role = isSuper ? 'SUPER_ADMIN' : 'COMPANY_ADMIN';
          let name = isSuper ? 'مدير النظام (Super Admin)' : 'مسؤول الشركة';
          let companyId = undefined;
          let photoURL = firebaseUser.photoURL || localStorage.getItem('aysed_user_avatar') || '';

          // Attempt to fetch profile & check account status
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              // Check if account is suspended or blocked
              if (data.status === 'blocked' || data.status === 'disabled' || data.suspended === true) {
                await signOut(auth);
                setUser(null);
                setToken(null);
                toast.error('تم إيقاف حسابك من قبل إدارة النظام.');
                setIsLoading(false);
                return;
              }
              role = data.role || role;
              name = data.name || name;
              companyId = data.companyId;
              photoURL = data.photoURL || data.avatar || photoURL;
            } else {
              if (isSuper) {
                // Auto-seed for the first time login if it's the known admin
                const { setDoc } = await import('firebase/firestore');
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  email: firebaseUser.email,
                  name: 'مدير النظام المركزية',
                  role: 'SUPER_ADMIN',
                  photoURL: photoURL,
                  createdAt: new Date().toISOString()
                });
                role = 'SUPER_ADMIN';
                name = 'مدير النظام المركزية';
              } else {
                // Not a super admin. Look up if this email is registered in 'companies'
                const { getDocs, collection, query, where, setDoc } = await import('firebase/firestore');
                const compQuery = query(collection(db, 'companies'), where('adminUsername', '==', firebaseUser.email));
                const compSnap = await getDocs(compQuery);
                
                let foundCompany = null;
                if (!compSnap.empty) {
                  foundCompany = compSnap.docs[0];
                } else {
                  // Fallback search with 'email' field
                  const compQuery2 = query(collection(db, 'companies'), where('email', '==', firebaseUser.email));
                  const compSnap2 = await getDocs(compQuery2);
                  if (!compSnap2.empty) {
                    foundCompany = compSnap2.docs[0];
                  }
                }

                if (foundCompany) {
                  const compData = foundCompany.data();
                  role = 'COMPANY_ADMIN';
                  name = compData.ownerName || compData.nameAr || 'مسؤول الشركة';
                  companyId = foundCompany.id;

                  // Seed user document as COMPANY_ADMIN
                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    email: firebaseUser.email,
                    name: name,
                    role: 'COMPANY_ADMIN',
                    companyId: companyId,
                    photoURL: photoURL,
                    createdAt: new Date().toISOString()
                  });
                } else {
                  // Fallback default company admin role safely
                  role = 'COMPANY_ADMIN';
                  name = 'مسؤول شركة جديد';
                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    email: firebaseUser.email,
                    name: name,
                    role: 'COMPANY_ADMIN',
                    photoURL: photoURL,
                    createdAt: new Date().toISOString()
                  });
                }
              }
            }
          } catch (e) {
             console.warn("Could not fetch or seed user profile from firestore:", e);
          }

          const jwt = await firebaseUser.getIdToken();
          
          setUser({
            id: firebaseUser.uid,
            name,
            email: firebaseUser.email || '',
            role,
            companyId,
            photoURL
          });
          setToken(jwt);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Auth state change error", err);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Inactivity Firewall Monitor (Auto-logout on idle)
  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        toast.error('تم إنهاء الجلسة وإغلاق الحساب تلقائياً بسبب عدم النشاط (الجدار الناري).', { duration: 6000 });
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Events to monitor activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [user]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem('aysed_debug');
      localStorage.removeItem('odoo_debug_mode');
      localStorage.removeItem('activeCompanyId');
      localStorage.removeItem('odoo_active_company_id');
      toast.success('تم تسجيل الخروج وتأمين الجلسة بنجاح.');
    } catch (err) {
      console.error("Logout error", err);
      setUser(null);
      setToken(null);
    }
  };

  const toggleDebugMode = () => {
    setIsDebugMode((prev) => {
      const nextState = !prev;
      const url = new URL(window.location.href);
      if (nextState) {
        url.searchParams.set('debug', '1');
      } else {
        url.searchParams.delete('debug');
      }
      window.history.replaceState({}, '', url.toString());
      return nextState;
    });
  };

  const updateAvatar = async (url: string) => {
    if (!auth.currentUser) {
      setUser(prev => prev ? { ...prev, photoURL: url } : null);
      localStorage.setItem('aysed_user_avatar', url);
      return;
    }
    try {
      const { setDoc } = await import('firebase/firestore');
      const { updateProfile } = await import('firebase/auth');

      // Firebase Auth photoURL is limited to max 2048 chars. Avoid setting long base64 data URLs on auth profile
      if (url && url.length <= 2000 && !url.startsWith('data:')) {
        try {
          await updateProfile(auth.currentUser, { photoURL: url });
        } catch (authProfileErr) {
          console.warn('Firebase Auth photoURL bypassed (exceeds limit):', authProfileErr);
        }
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: url,
        avatar: url,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setUser(prev => prev ? { ...prev, photoURL: url } : null);
      localStorage.setItem('aysed_user_avatar', url);
    } catch (err) {
      console.error("Error updating avatar:", err);
      setUser(prev => prev ? { ...prev, photoURL: url } : null);
      localStorage.setItem('aysed_user_avatar', url);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isDebugMode, isLoading, login, logout, toggleDebugMode, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
