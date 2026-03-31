'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthPage from '@/components/Auth/AuthPage';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 如果用户已登录，重定向到编辑器
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/editor');
    }
  }, [user, isLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 如果用户未登录，显示登录/注册页面
  if (!user) {
    return <AuthPage />;
  }

  // 如果用户已登录但还未重定向，显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
