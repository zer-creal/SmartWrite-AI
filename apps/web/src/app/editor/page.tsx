'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import RecentFiles from '@/components/Dashboard/RecentFiles';
import QuickActions from '@/components/Dashboard/QuickActions';
import UsageTrend from '@/components/Dashboard/UsageTrend';

export default function EditorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来 👋</h1>
          <p className="text-gray-600">开始你的创作之旅</p>
        </div>

        <QuickActions />
        <DashboardStats />
        <UsageTrend />
        <RecentFiles />
      </div>
    </DashboardLayout>
  );
}
