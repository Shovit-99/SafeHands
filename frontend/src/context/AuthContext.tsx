import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../api/axios';
import { disconnectSocket } from '../hooks/useSocket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  persist2FA: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Hydrate from LocalStorage ───────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('safehands_token');
    const storedUser = localStorage.getItem('safehands_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // ─── Persist to LocalStorage ─────────────────────────────────────────────
  const persist = (token: string, user: User) => {
    localStorage.setItem('safehands_token', token);
    localStorage.setItem('safehands_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requires2FA || data.requires2FASetup) {
      return data;
    }
    persist(data.token, data.user);
    return data;
  };

  const persist2FA = (token: string, newUser: User) => {
    persist(token, newUser);
  };

  const updateUser = (newUser: User) => {
    if (token) {
      persist(token, newUser);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    if (data.requires2FASetup) {
      return data;
    }
    persist(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('safehands_token');
    localStorage.removeItem('safehands_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        persist2FA,
        updateUser,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
