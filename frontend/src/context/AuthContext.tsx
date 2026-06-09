import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  userId: number;
  username: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string, userId: number, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (token: string, userId: number, username: string) => {
    const authUser = { token, userId, username };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
