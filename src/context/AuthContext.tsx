import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isDebugMode: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  toggleDebugMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultAdmin = { id: 1, name: 'مدير النظام', email: 'admin@almanarclinic.com', role: 'SUPER_ADMIN' };
  const defaultToken = 'token_session_active';

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('aysed_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('aysed_token') || null;
  });


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

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('aysed_token', newToken);
    localStorage.setItem('aysed_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aysed_token');
    localStorage.removeItem('aysed_user');
    localStorage.removeItem('aysed_debug');
    localStorage.removeItem('odoo_debug_mode');
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
    <AuthContext.Provider value={{ user, token, isDebugMode, login, logout, toggleDebugMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
