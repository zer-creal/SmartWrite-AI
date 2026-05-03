'use client';

import { FileText, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useFileManager } from '@/context/FileManagerContext';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { files } = useFileManager();

  const totalDocs = files.length;
  const recentDocs = files.slice(0, 5);

  const today = new Date();
  const thisMonth = files.filter(file => {
    const fileDate = new Date(file.updatedAt);
    return fileDate.getMonth() === today.getMonth() &&
           fileDate.getFullYear() === today.getFullYear();
  }).length;

  const todayDocs = files.filter(file => {
    const fileDate = new Date(file.updatedAt);
    const todayStr = today.toDateString();
    return fileDate.toDateString() === todayStr;
  }).length;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          label="文档总数"
          value={totalDocs}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-green-600" />}
          label="今日编辑"
          value={todayDocs}
          color="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          label="本月编辑"
          value={thisMonth}
          color="bg-purple-50"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          label="最近访问"
          value={recentDocs.length}
          color="bg-orange-50"
        />
      </div>
    </div>
  );
}
