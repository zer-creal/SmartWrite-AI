'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// 本地存储键名
const STORAGE_KEY = 'smartwrite_users';
const SESSION_KEY = 'smartwrite_current_user';

// 模拟用户数据类型
interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 获取所有用户
const getUsers = (): StoredUser[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 保存用户
const saveUser = (user: StoredUser): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// 查找用户
const findUser = (email: string): StoredUser | undefined => {
  return getUsers().find(u => u.email === email);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // 从本地存储恢复会话
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const storedUser = findUser(sessionData.email);
        
        if (storedUser) {
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            avatar: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  // 登录
  const signIn = async (email: string, password: string) => {
    const storedUser = findUser(email);
    
    if (!storedUser) {
      throw new Error('用户不存在，请先注册');
    }
    
    if (storedUser.password !== password) {
      throw new Error('邮箱或密码错误');
    }
    
    // 设置会话
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    
    setUser({
      id: storedUser.id,
      email: storedUser.email,
      name: storedUser.name,
      avatar: null,
    });
  };

  // 注册
  const signUp = async (email: string, password: string, name: string) => {
    const existingUser = findUser(email);
    
    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }
    
    if (password.length < 6) {
      throw new Error('密码长度至少为6位');
    }
    
    const newUser: StoredUser = {
      id: generateId(),
      email,
      password,
      name,
      createdAt: Date.now(),
    };
    
    saveUser(newUser);
    
    // 注册后自动登录
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    
    setUser({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: null,
    });
  };

  // 登出
  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    const storedUser = findUser(email);
    
    if (!storedUser) {
      throw new Error('该邮箱未注册');
    }
    
    // 简单模拟重置密码（实际项目中会发送邮件）
    console.log('Password reset link sent to:', email);
    throw new Error('密码重置功能暂未实现，请直接使用新密码注册');
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
