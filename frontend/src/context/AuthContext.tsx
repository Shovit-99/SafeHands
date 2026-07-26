import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../api/axios';
import { disconnectSocket } from '../hooks/useSocket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  updateUser: (user: User) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
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
    const storedToken = localStorage.getItem('losthub_token');
    const storedUser = localStorage.getItem('losthub_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // ─── Persist to LocalStorage ─────────────────────────────────────────────
  const persist = (token: string, user: User) => {
    localStorage.setItem('losthub_token', token);
    localStorage.setItem('losthub_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
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
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem('losthub_token');
    localStorage.removeItem('losthub_user');
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
