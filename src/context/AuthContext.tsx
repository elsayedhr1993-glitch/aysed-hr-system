import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string; // For tenant isolation
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isDebugMode: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  toggleDebugMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user role and company info from Firestore if needed
          const isSuper = ['admin@aysed.com', 'elsayedhr1993@gmail.com', 'admin@aysed-hr.com'].includes(firebaseUser.email?.toLowerCase() || '');
          let role = isSuper ? 'SUPER_ADMIN' : 'COMPANY_ADMIN';
          let name = isSuper ? 'مدير النظام (Super Admin)' : 'مسؤول الشركة';
          let companyId = undefined;

          // Attempt to fetch profile
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              role = data.role || role;
              name = data.name || name;
              companyId = data.companyId;
            } else {
              if (isSuper) {
                // Auto-seed for the first time login if it's the known admin
                const { setDoc } = await import('firebase/firestore');
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  email: firebaseUser.email,
                  name: 'مدير النظام المركزية',
                  role: 'SUPER_ADMIN',
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
            companyId
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

  const login = (newToken: string, userData: User) => {
    // This is a placeholder since Firebase handles real login via signInWithEmailAndPassword in OdooLoginPage
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      localStorage.removeItem('aysed_debug');
      localStorage.removeItem('odoo_debug_mode');
    } catch (err) {
      console.error("Logout error", err);
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

  return (
    <AuthContext.Provider value={{ user, token, isDebugMode, isLoading, login, logout, toggleDebugMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
