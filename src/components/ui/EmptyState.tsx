'use client';

import { FileText, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type?: 'documents' | 'editor';
}

export default function EmptyState({ type = 'documents' }: EmptyStateProps) {
  if (type === 'documents') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4">
        {/* 插画 */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
            <FileText className="w-16 h-16 text-blue-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* 文字 */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          还没有文档
        </h3>
        <p className="text-gray-500 text-center max-w-sm mb-8">
          点击左下角创建你的第一篇文档，开始你的创作之旅
        </p>
        
        {/* 创建按钮 */}
        <Link
          href="/editor/new-doc"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          创建第一篇文档
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        文档加载失败
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        请检查网络连接或刷新页面重试
      </p>
    </div>
  );
}
