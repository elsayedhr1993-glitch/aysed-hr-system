import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db, isTenantPurged } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AUTH_USER_KEY = 'aysed_auth_user';
const AUTH_TOKEN_KEY = 'aysed_auth_token';
const REMEMBER_ME_KEY = 'aysed_remember_me';

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

const getRememberMePreference = () => {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch {
    return false;
  }
};

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
};

const persistAuthStorage = (userData: User, jwt: string) => {
  const rememberMe = getRememberMePreference();
  const primaryStorage = rememberMe ? localStorage : sessionStorage;
  const secondaryStorage = rememberMe ? sessionStorage : localStorage;

  try {
    primaryStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    primaryStorage.setItem(AUTH_TOKEN_KEY, jwt);
    secondaryStorage.removeItem(AUTH_USER_KEY);
    secondaryStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isDebugMode, setIsDebugMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === '1' || localStorage.getItem('aysed_debug') === 'true' || localStorage.getItem('odoo_debug_mode') === 'true';
  });

  useEffect(() => {
    if (isDebugMode) {
      localStorage.setItem('aysed_debug', 'true');
      localStorage.setItem('odoo_debug_mode', 'true');
    } else {
      localStorage.removeItem('aysed_debug');
      localStorage.removeItem('odoo_debug_mode');
    }
  }, [isDebugMode]);

  // Auth Firewall State Listener with safety timeout to prevent hanging UI
  useEffect(() => {
    // Safety fallback timer: Ensure loading never hangs if Firebase takes too long or is blocked
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      clearTimeout(safetyTimer);
      try {
        if (firebaseUser) {
          const userEmail = (firebaseUser.email || '').toLowerCase();

          // 1. Firewall check for purged/blacklisted tenant
          if (isTenantPurged(userEmail)) {
            await signOut(auth).catch(() => {});
            setUser(null);
            setToken(null);
            clearAuthStorage();
            toast.error('تم حظر الوصول: الحساب معطل أو ملغى بجدار حماية المنظومة.');
            setIsLoading(false);
            return;
          }

          // Fetch user role and company info from Firestore if needed
          let role = 'COMPANY_ADMIN';
          let name = 'مسؤول الشركة';
          let companyId: string | undefined;
          let photoURL = firebaseUser.photoURL || localStorage.getItem('aysed_user_avatar') || '';

          // Attempt to fetch profile & check account status with timeout
          try {
            const userDocPromise = getDoc(doc(db, 'users', firebaseUser.uid));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
            const userDoc: any = await Promise.race([userDocPromise, timeoutPromise]);
            
            if (userDoc && userDoc.exists && userDoc.exists()) {
              const data = userDoc.data();
              // Check if account is suspended or blocked
              if (data.status === 'blocked' || data.status === 'disabled' || data.suspended === true) {
                await signOut(auth).catch(() => {});
                setUser(null);
                setToken(null);
                clearAuthStorage();
                toast.error('تم إيقاف حسابك من قبل إدارة النظام.');
                setIsLoading(false);
                return;
              }
              role = data.role || role;
              name = data.name || name;
              companyId = data.companyId;
              photoURL = data.photoURL || data.avatar || photoURL;
            } else {
              // Look up if this email is registered in company collections
              const { getDocs, collection, query, where, setDoc } = await import('firebase/firestore');
              const collectionName = (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies');
              const compQuery = query(collection(db, collectionName), where('adminUsername', '==', firebaseUser.email));
              const compSnap = await getDocs(compQuery).catch(() => null);

              let foundCompany = null;
              if (compSnap && !compSnap.empty) {
                foundCompany = compSnap.docs[0];
              } else {
                const compQuery2 = query(collection(db, collectionName), where('email', '==', firebaseUser.email));
                const compSnap2 = await getDocs(compQuery2).catch(() => null);
                if (compSnap2 && !compSnap2.empty) {
                  foundCompany = compSnap2.docs[0];
                }
              }

              if (foundCompany) {
                const compData = foundCompany.data();
                role = 'COMPANY_ADMIN';
                name = compData.ownerName || compData.nameAr || 'مسؤول الشركة';
                companyId = foundCompany.id;
              } else {
                role = 'COMPANY_ADMIN';
                name = 'مسؤول شركة جديد';
              }

              await setDoc(doc(db, 'users', firebaseUser.uid), {
                email: firebaseUser.email,
                name,
                role,
                companyId: companyId || null,
                photoURL,
                createdAt: new Date().toISOString()
              }, { merge: true }).catch(() => {});
            }
          } catch (e) {
            console.warn('Auth profile lookup skipped.');
          }

          let jwt = 'session-token';
          try {
            jwt = await firebaseUser.getIdToken();
          } catch (_) {}
          
          const fullUser: User = {
            id: firebaseUser.uid,
            name,
            email: firebaseUser.email || '',
            role,
            companyId,
            photoURL
          };
          setUser(fullUser);
          setToken(jwt);
          persistAuthStorage(fullUser, jwt);
        } else {
          // If no firebaseUser, only clear if there is no locally saved active master session
          const saved = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
          if (!saved) {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('Auth state processing failed.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
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
    persistAuthStorage(userData, newToken);
  };

  const logout = async () => {
    try {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      await signOut(auth).catch(() => {});
      setUser(null);
      setToken(null);
      clearAuthStorage();
      localStorage.removeItem('aysed_debug');
      localStorage.removeItem('odoo_debug_mode');
      localStorage.removeItem('activeCompanyId');
      localStorage.removeItem('odoo_active_company_id');
      toast.success('تم تسجيل الخروج وتأمين الجلسة بنجاح.');
    } catch (err) {
      console.warn('Logout completed with a non-critical issue.');
      setUser(null);
      setToken(null);
      clearAuthStorage();
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
      console.warn('Avatar update completed with a non-critical issue.');
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
