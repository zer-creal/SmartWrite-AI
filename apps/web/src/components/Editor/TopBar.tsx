'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  Share2, 
  MoreHorizontal,
  Users,
  Star,
  Clock,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface TopBarProps {
  docId: string;
  docTitle?: string;
}

export default function TopBar({ docId, docTitle = '未命名文档' }: TopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(docTitle);
  const [isStarred, setIsStarred] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 左侧：面包屑导航 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
              工作区
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-[200px]">
              {title}
            </span>
          </div>

          {/* 中间：文档标题（可编辑） */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="text-center font-medium text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none px-2 py-1"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-2 text-center font-medium text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
              >
                <span className="truncate max-w-[300px]">{title}</span>
                <Star 
                  className={`w-4 h-4 transition-colors ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 group-hover:text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStarred(!isStarred);
                  }}
                />
              </button>
            )}
          </div>

          {/* 右侧：操作按钮组 */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 分享按钮 */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>

            {/* 协作状态指示器 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <div className="relative">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-50 flex items-center justify-center text-white text-xs font-medium">
                    AI
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-emerald-50 flex items-center justify-center text-white text-xs font-medium">
                    张
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <span className="text-xs font-medium hidden sm:inline">2 人在线</span>
            </div>

            {/* AI 助手按钮 */}
            <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </button>

            {/* 更多选项 */}
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 移动端标题显示 */}
        <div className="md:hidden pb-3">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-full font-semibold text-lg text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="w-full text-left font-semibold text-lg text-gray-900 flex items-center gap-2"
            >
              <span className="truncate">{title}</span>
              <Star 
                className={`w-5 h-5 flex-shrink-0 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStarred(!isStarred);
                }}
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
