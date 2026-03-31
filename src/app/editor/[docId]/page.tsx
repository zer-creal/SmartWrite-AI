'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

// 动态导入编辑器组件以避免 SSR 问题
const TiptapEditor = dynamic(() => import('@/components/Editor/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
    </div>
  ),
});

export default function EditorPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
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

  // 如果用户未登录，显示加载状态（会重定向）
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout currentDocId={docId}>
      <div className="flex flex-col h-full bg-white">
        {/* 编辑器主体 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TiptapEditor docId={docId} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
