'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar,
      } : null);
      setIsLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error('Auth session error:', error);
          setUser(null);
        } else if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name,
            avatar: data.session.user.user_metadata?.avatar,
          });
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error('Auth state check failed:', error);
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 登录
  const signIn = async (email: string, password: string) => {
    console.log('Signing in with:', email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    console.log('Sign in result:', { error, data });
    if (error) throw error;
  };

  // 注册
  const signUp = async (email: string, password: string, name: string) => {
    console.log('Signing up with:', email, name);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    console.log('Sign up result:', { error, data });
    if (error) throw error;
  };

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
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
