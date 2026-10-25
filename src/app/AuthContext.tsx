import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import { mockStore } from '../mocks/mockStore';
import { ENV } from '../config/env';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  loginAsDemoUser: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In demo mode, start with the default citizen user so reviewer can explore immediately
  const [user, setUser] = useState<User | null>(() => {
    if (ENV.IS_DEMO) {
      return mockStore.getCurrentUser();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!ENV.IS_DEMO);

  useEffect(() => {
    // Register 401 callback
    setUnauthorizedHandler(() => {
      setUser(null);
      setAuthToken(null);
    });

    if (!ENV.IS_DEMO) {
      // Real API mode: check current session via /auth/me
      authService
        .getMe()
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authService.login(email, pass);
    setUser(res.user);
    return res.user;
  };

  const loginAsDemoUser = (targetUser: User) => {
    mockStore.setCurrentUser(targetUser);
    setAuthToken(`demo-token-${targetUser.id}`);
    setUser(targetUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    if (ENV.IS_DEMO) {
      mockStore.setCurrentUser(next);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsDemoUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
