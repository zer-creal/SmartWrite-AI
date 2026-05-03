'use client';

import { useRouter } from 'next/navigation';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import { useFileManager } from '@/context/FileManagerContext';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function RecentFiles() {
  const router = useRouter();
  const { files } = useFileManager();

  const recentFiles = files.slice(0, 5);

  if (recentFiles.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          最近访问
        </h2>
        <p className="text-gray-500 text-sm">暂无最近访问的文档</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        最近访问
      </h2>
      <div className="space-y-2">
        {recentFiles.map((file) => (
          <button
            key={file.id}
            onClick={() => router.push(`/editor/${file.id}`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.title || '未命名文档'}</p>
              <p className="text-xs text-gray-500">{formatRelativeTime(file.updatedAt)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
