'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Plus, 
  Settings, 
  Search, 
  Menu,
  X,
  FileText,
  MoreHorizontal,
  ChevronDown,
  Home,
  Trash2,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useFileManager } from '@/context/FileManagerContext';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children, currentDocId }: { children: React.ReactNode; currentDocId?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const { files, createFile, deleteFile, currentFileId } = useFileManager();
  const { user, signOut } = useAuth();

  const filteredFiles = files.filter((file) =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理登出
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleCreateNewPage = async () => {
    console.log('handleCreateNewPage function called');
    console.log('Current user:', user);
    try {
      // 确保用户已登录
      if (!user) {
        console.log('User not logged in, redirecting to login');
        router.push('/');
        return;
      }
      
      console.log('Calling createFile...');
      const newFile = await createFile();
      console.log(`📝 新建文档成功: ${newFile.id}`);
      router.push(`/editor/${newFile.id}`);
    } catch (error) {
      console.error('创建文档失败:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // 如果是 RLS 策略违反错误，可能是用户会话过期，重定向到登录页面
      if (error && typeof error === 'object' && 'code' in error && error.code === '42501') {
        console.log('RLS policy violation, redirecting to login');
        router.push('/');
      }
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (window.confirm(`确定要删除文档 "${file.title}" 吗？此操作无法撤销。`)) {
      try {
        await deleteFile(fileId);
        console.log(`🗑️ 删除文档成功: ${fileId}`);
        
        if (currentDocId === fileId) {
          const remainingFiles = files.filter(f => f.id !== fileId);
          if (remainingFiles.length > 0) {
            router.push(`/editor/${remainingFiles[0].id}`);
          } else {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('删除文档失败:', error);
      }
    }
  };

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 左侧侧边栏 */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 bg-[#F7F7F5] border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* 工作区头部 */}
        <div className="p-4 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm text-gray-900">SmartWrite</h2>
              <p className="text-xs text-gray-500">个人工作区</p>
            </div>
            <button 
              className="lg:hidden p-1 hover:bg-gray-200 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200/60 shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文档"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
                aria-label="清除搜索"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="px-2 space-y-0.5">
          <Link 
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            主页
          </Link>
        </nav>

        {/* 文档列表 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              文档 ({filteredFiles.length})
            </span>
            <button 
              onClick={handleCreateNewPage}
              className="p-1 hover:bg-gray-200/50 rounded transition-colors"
              title="新建文档"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {files.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>暂无文档</p>
              <p className="text-xs mt-1">点击上方按钮创建</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative"
                >
                  <Link
                    href={`/editor/${file.id}`}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200
                      ${currentFileId === file.id 
                        ? 'bg-white shadow-sm text-gray-900 font-medium' 
                        : 'text-gray-600 hover:bg-gray-200/50'
                      }
                    `}
                  >
                    <span className="text-base">{file.icon}</span>
                    <span className="flex-1 truncate">{file.title}</span>
                    {currentFileId === file.id && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </Link>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDeleteFile(e, file.id)}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2
                      p-1.5 rounded-md transition-all duration-200
                      ${currentFileId === file.id 
                        ? 'opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'
                      }
                      hover:bg-red-100 hover:text-red-600
                      text-gray-400
                    `}
                    title="删除文档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        <div className="p-3 border-t border-gray-200/60 space-y-1">
          <button 
            onClick={handleCreateNewPage}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建页面
          </button>
          
          <div className="relative">
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="flex-1 text-left">{user?.email || '用户'}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <Settings className="w-4 h-4" />
                  设置
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* 移动端顶部栏 */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900">SmartWrite</span>
        </div>

        {/* 页面内容 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
