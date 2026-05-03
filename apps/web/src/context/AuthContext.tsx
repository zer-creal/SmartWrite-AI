'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('smartwrite_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('smartwrite_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const storedUser = localStorage.getItem(`smartwrite_user_${email}`);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.password === password) {
        const user = { id: userData.id, email: userData.email, name: userData.name };
        localStorage.setItem('smartwrite_user', JSON.stringify(user));
        setUser(user);
        return;
      }
    }
    throw new Error('邮箱或密码错误');
  };

  const signUp = async (email: string, password: string, name: string) => {
    const existingUser = localStorage.getItem(`smartwrite_user_${email}`);
    if (existingUser) {
      throw new Error('该邮箱已注册');
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = { id, email, name, password };
    localStorage.setItem(`smartwrite_user_${email}`, JSON.stringify(userData));

    const user = { id, email, name };
    localStorage.setItem('smartwrite_user', JSON.stringify(user));
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem('smartwrite_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
