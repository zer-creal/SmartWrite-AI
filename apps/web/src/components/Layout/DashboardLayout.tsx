'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Pencil,
  CheckSquare,
  Square,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useFileManager } from '@/context/FileManagerContext';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/Common/ConfirmDialog';

export default function DashboardLayout({ children, currentDocId }: { children: React.ReactNode; currentDocId?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const router = useRouter();
  
  const { files, createFile, deleteFile, deleteFiles, updateFile, currentFileId } = useFileManager();
  const { user, signOut } = useAuth();

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter((file) => 
      file.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

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
    if (!user) {
      router.push('/');
      return;
    }

    try {
      const newFile = await createFile();
      
      // 如果是临时文件，等待真实文件创建完成后再导航
      if (newFile.id.startsWith('temp-')) {
        // 临时文件，直接导航但显示加载状态
        router.push(`/editor/${newFile.id}`);
      } else {
        // 真实文件，正常导航
        router.push(`/editor/${newFile.id}`);
      }
    } catch (error) {
      console.error('创建文档失败:', error);
      alert('创建文档失败，请稍后重试');
    }
  };

  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setConfirmDialog({
      isOpen: true,
      title: '删除文档',
      message: `确定要删除文档 "${file.title}" 吗？此操作无法撤销。`,
      onConfirm: async () => {
        try {
          await deleteFile(fileId);
          
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
        setConfirmDialog(null);
      },
    });
  };

  const handleRenameFile = (e: React.MouseEvent, fileId: string, currentTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingFileId(fileId);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = async () => {
    if (!editingFileId || !editingTitle.trim()) {
      setEditingFileId(null);
      return;
    }
    try {
      await updateFile(editingFileId, { title: editingTitle.trim() });
      // 重命名成功
    } catch (error) {
      console.error('重命名失败:', error);
    } finally {
      setEditingFileId(null);
    }
  };

  const handleCancelRename = () => {
    setEditingFileId(null);
    setEditingTitle('');
  };

  const handleToggleSelect = (fileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedFileIds.size === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: '批量删除文档',
      message: `确定要删除选中的 ${selectedFileIds.size} 个文档吗？此操作无法撤销。`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedFileIds);
        const currentDocIdToDelete = idsToDelete.includes(currentDocId || '');

        try {
          await deleteFiles(idsToDelete);

          if (currentDocIdToDelete) {
            const remainingFiles = files.filter(f => !idsToDelete.includes(f.id));
            if (remainingFiles.length > 0) {
              router.push(`/editor/${remainingFiles[0].id}`);
            } else {
              router.push('/');
            }
          }

          setSelectedFileIds(new Set());
          setIsSelectMode(false);
        } catch (error) {
          console.error('批量删除失败:', error);
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleExitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedFileIds(new Set());
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
          {isSelectMode ? (
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={selectedFileIds.size === filteredFiles.length ? '取消全选' : '全选'}
                >
                  {selectedFileIds.size === filteredFiles.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <span className="text-xs font-medium text-gray-500">
                  已选择 {selectedFileIds.size} 项
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedFileIds.size === 0}
                  className={`p-1.5 rounded transition-colors ${
                    selectedFileIds.size > 0
                      ? 'hover:bg-red-100 text-red-600'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="批量删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExitSelectMode}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-500"
                  title="取消选择"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                文档 ({filteredFiles.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="p-1 hover:bg-gray-200/50 rounded transition-colors"
                  title="选择模式"
                >
                  <CheckSquare className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleCreateNewPage}
                  className="p-1 hover:bg-gray-200/50 rounded transition-colors"
                  title="新建文档"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
          
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
                  {editingFileId === file.id ? (
                    <div className="flex items-center gap-1 px-3 py-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onBlur={handleSaveRename}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        onClick={(e) => e.preventDefault()}
                      />
                    </div>
                  ) : isSelectMode ? (
                    <button
                      onClick={() => handleToggleSelect(file.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-200/50"
                    >
                      {selectedFileIds.has(file.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-base">{file.icon}</span>
                      <span className="flex-1 truncate text-left">{file.title}</span>
                    </button>
                  ) : (
                    <>
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
                      
                      {/* 操作按钮组 */}
                      <div className={`
                        absolute right-2 top-1/2 -translate-y-1/2
                        flex items-center gap-0.5
                        transition-all duration-200
                        ${currentFileId === file.id 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover:opacity-100'
                        }
                      `}>
                        {/* 重命名按钮 */}
                        <button
                          onClick={(e) => handleRenameFile(e, file.id, file.title)}
                          className="p-1.5 rounded-md hover:bg-blue-100 hover:text-blue-600 text-gray-400 transition-colors"
                          title="重命名"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={(e) => handleDeleteFile(e, file.id)}
                          className="p-1.5 rounded-md hover:bg-red-100 hover:text-red-600 text-gray-400 transition-colors"
                          title="删除文档"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
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

      {/* 确认对话框 */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
