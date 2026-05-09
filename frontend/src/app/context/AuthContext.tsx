import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../../services/api';

export type UserRole = 'donor' | 'admin' | 'vet' | 'clinic' | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved?: boolean;
  avatarUrl?: string;
  clinicName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  role: UserRole;
  login: (credentials: any) => Promise<AuthUser>;
  register: (userData: any) => Promise<AuthUser>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isApproved: true, // Assume approved for now
      });
    } catch (error) {
      console.error('Failed to authenticate:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    const userData: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      isApproved: true,
    };
    setUser(userData);
    return userData;
  };

  const register = async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    const newUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      isApproved: true,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, role: user?.role ?? null, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}