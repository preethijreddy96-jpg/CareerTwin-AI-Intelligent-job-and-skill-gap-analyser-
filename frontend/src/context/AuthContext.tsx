import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  activeResumeId: number | null;
  setActiveResumeId: (id: number | null) => void;
  login: (token: string, userData: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('careertwin_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('careertwin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeResumeId, setActiveResumeIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('careertwin_active_resume');
    return saved ? Number(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const setActiveResumeId = (id: number | null) => {
    setActiveResumeIdState(id);
    if (id !== null) {
      localStorage.setItem('careertwin_active_resume', String(id));
    } else {
      localStorage.removeItem('careertwin_active_resume');
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      localStorage.setItem('careertwin_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('careertwin_token', newToken);
    localStorage.setItem('careertwin_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveResumeId(null);
    localStorage.removeItem('careertwin_token');
    localStorage.removeItem('careertwin_user');
    localStorage.removeItem('careertwin_active_resume');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeResumeId,
        setActiveResumeId,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

