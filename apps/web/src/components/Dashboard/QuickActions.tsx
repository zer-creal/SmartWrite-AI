'use client';

import { useRouter } from 'next/navigation';
import { Plus, FileText, Upload, FolderOpen } from 'lucide-react';
import { useFileManager } from '@/context/FileManagerContext';
import { useAuth } from '@/context/AuthContext';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}

function QuickAction({ icon, label, description, onClick, color }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white text-left group"
    >
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

export default function QuickActions() {
  const router = useRouter();
  const { createFile } = useFileManager();
  const { user } = useAuth();

  const handleCreateNew = async () => {
    if (!user) {
      router.push('/');
      return;
    }
    try {
      const newFile = await createFile();
      router.push(`/editor/${newFile.id}`);
    } catch (error) {
      console.error('创建文档失败');
    }
  };

  const handleOpenRecent = () => {
    router.push('/editor');
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={<Plus className="w-6 h-6 text-white" />}
          label="新建文档"
          description="创建空白文档"
          onClick={handleCreateNew}
          color="bg-blue-600 hover:bg-blue-700"
        />
        <QuickAction
          icon={<FolderOpen className="w-6 h-6 text-gray-600" />}
          label="打开文档"
          description="浏览所有文档"
          onClick={handleOpenRecent}
          color="bg-gray-100 hover:bg-gray-200"
        />
        <QuickAction
          icon={<Upload className="w-6 h-6 text-gray-600" />}
          label="导入文档"
          description="从本地上传"
          onClick={() => alert('导入功能开发中')}
          color="bg-gray-100 hover:bg-gray-200"
        />
        <QuickAction
          icon={<FileText className="w-6 h-6 text-gray-600" />}
          label="使用模板"
          description="从模板创建"
          onClick={() => alert('模板功能开发中')}
          color="bg-gray-100 hover:bg-gray-200"
        />
      </div>
    </div>
  );
}
