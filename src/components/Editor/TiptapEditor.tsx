'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  MessageSquare, 
  Sparkles,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  CheckSquare,
  X,
  Upload,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { common, createLowlight } from 'lowlight';
import './editor-styles.css';

// 初始化 lowlight 用于代码高亮
const lowlight = createLowlight(common);

interface VirtualCursor {
  id: string;
  name: string;
  color: string;
  top: number;
  left: number;
  visible: boolean;
}

interface TiptapEditorProps {
  docId: string;
}

const VIRTUAL_USERS = [
  { name: 'AI 助手', color: '#10b981' },
  { name: '张三', color: '#3b82f6' },
  { name: '李四', color: '#f59e0b' },
  { name: '王五', color: '#ef4444' },
  { name: '团队成员', color: '#8b5cf6' },
];

export default function TiptapEditor({ docId }: TiptapEditorProps) {
  const [virtualCursors, setVirtualCursors] = useState<VirtualCursor[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "输入 '/' 查看命令，或开始写作...",
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-slate-900 text-slate-50 p-4 my-4 overflow-x-auto',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-0',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
        nested: true,
      }),
      Typography,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      // 防抖自动保存
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 1000);
    },
  });

  // 验证 UUID 格式
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // 从 Supabase 获取文档
  useEffect(() => {
    const fetchDocument = async () => {
      if (!docId || authIsLoading) return;
      if (!user) {
        console.warn('用户未登录，无法获取文档');
        setIsLoading(false);
        return;
      }

      if (!isValidUUID(docId)) {
        console.error('无效的文档 ID 格式:', docId);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', docId)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('获取文档失败:', error);
          if (error.code === '42501') {
            console.error('行级安全策略阻止了访问，请在 Supabase 控制台中配置 RLS 策略');
          }
        } else if (data) {
          setCurrentDocument(data);
          if (editor) {
            editor.commands.setContent(data.content || '', false);
          }
        }
      } catch (error) {
        console.error('获取文档时发生错误:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [docId, editor, authIsLoading, user]);

  // 自动保存到 Supabase
  const handleAutoSave = useCallback(async () => {
    if (!editor || !docId || !user) return;
    
    if (!isValidUUID(docId)) {
      console.error('无效的文档 ID 格式:', docId);
      setIsSaving(false);
      return;
    }
    
    try {
      const content = editor.getJSON();
      const { error } = await supabase
        .from('documents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', docId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('保存文档失败:', error);
        if (error.code === '42501') {
          console.error('行级安全策略阻止了保存，请在 Supabase 控制台中配置 RLS 策略');
        }
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error('保存文档时发生错误:', error);
      setIsSaving(false);
    }
  }, [editor, docId, isValidUUID, user]);

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!editor || !docId || !user) return;
    
    if (!isValidUUID(docId)) {
      console.error('无效的文档 ID 格式:', docId);
      setIsSaving(false);
      return;
    }
    
    try {
      setIsSaving(true);
      const content = editor.getJSON();
      const { error } = await supabase
        .from('documents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', docId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('手动保存失败:', error);
        if (error.code === '42501') {
          console.error('行级安全策略阻止了保存，请在 Supabase 控制台中配置 RLS 策略');
        }
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error('手动保存时发生错误:', error);
      setIsSaving(false);
    }
  }, [editor, docId, isValidUUID, user]);

  // 插入图片到编辑器
  const insertImage = useCallback((src: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src }).run();
    }
  }, [editor]);

  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    insertImage(objectUrl);
    console.log('🖼️ 图片已插入:', file.name);
  }, [insertImage]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      setShowImageModal(false);
    }
  }, [handleFileUpload]);

  // 打开图片模态框
  const openImageModal = useCallback(() => {
    setShowImageModal(true);
  }, []);

  // 关闭图片模态框
  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

  // 添加链接
  const addLink = useCallback(() => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('请输入链接 URL:', previousUrl);
      
      if (url === null) return;
      
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }
  }, [editor]);

  // 切换代码块
  const toggleCodeBlock = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  }, [editor]);

  // 切换任务列表
  const toggleTaskList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleTaskList().run();
    }
  }, [editor]);

  const generateVirtualCursor = useCallback((): VirtualCursor => {
    const user = VIRTUAL_USERS[Math.floor(Math.random() * VIRTUAL_USERS.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: user.name,
      color: user.color,
      top: 100 + Math.random() * 400,
      left: 50 + Math.random() * 600,
      visible: true,
    };
  }, []);

  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newCursor = generateVirtualCursor();
        setVirtualCursors(prev => [...prev, newCursor]);

        setTimeout(() => {
          setVirtualCursors(prev => prev.filter(c => c.id !== newCursor.id));
        }, 4000 + Math.random() * 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [editor, generateVirtualCursor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative max-w-3xl mx-auto" ref={editorRef}>
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {isSaving ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>正在保存...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>已保存</span>
            </>
          )}
        </div>
        
        {/* 快捷工具栏 */}
        <div className="flex items-center gap-1">
          <button
            onClick={openImageModal}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            title="插入图片"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={addLink}
            className={`p-2 rounded-md transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            title="插入链接"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCodeBlock}
            className={`p-2 rounded-md transition-colors ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            title="代码块"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTaskList}
            className={`p-2 rounded-md transition-colors ${editor.isActive('taskList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            title="待办清单"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {/* 图片上传模态框 */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">插入图片</h3>
              <button
                onClick={closeImageModal}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 拖拽区域 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  拖拽图片到此处，或
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  选择文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center text-xs text-gray-500">
                支持 JPG、PNG、GIF、WebP 格式
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑器拖拽区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative"
      >
        {/* 拖拽提示遮罩 */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg z-40 flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-700">释放以上传图片</p>
            </div>
          </div>
        )}

        {/* 悬浮工具栏 */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 0,
            interactive: true,
            zIndex: 9999,
          }}
          shouldShow={({ editor, view, from, to }) => {
            if (from === to || editor.state.selection.empty) return false;
            
            const event = view.inputEvent;
            if (event && (event.type === 'mousedown' || event.type === 'mousemove')) return false;
            
            return true;
          }}
          className="bubble-menu-container flex items-center gap-1 bg-slate-900 text-white rounded-lg shadow-xl p-1.5"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('bold') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="加粗"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('italic') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="斜体"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="标题 1"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="标题 2"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('bulletList') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="无序列表"
            onMouseDown={(e) => e.preventDefault()}
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md transition-colors ${editor.isActive('orderedList') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="有序列表"
            onMouseDown={(e) => e.preventDefault()}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          <button
            onClick={() => console.log('AI 助手')}
            className="p-2 rounded-md transition-colors hover:bg-white/10 text-purple-300"
            title="AI 助手"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => console.log('评论')}
            className="p-2 rounded-md transition-colors hover:bg-white/10"
            title="评论"
            onMouseDown={(e) => e.preventDefault()}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </BubbleMenu>

        {/* 编辑器内容区域 */}
        <div className="relative min-h-[calc(100vh-200px)] py-8">
          <EditorContent 
            editor={editor} 
            className="prose-editor focus:outline-none"
          />

          {/* 虚拟用户光标 */}
          {virtualCursors.map((cursor) => (
            <div
              key={cursor.id}
              className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
              style={{
                top: cursor.top,
                left: cursor.left,
              }}
            >
              <div
                className="w-0.5 h-5 animate-pulse"
                style={{ 
                  backgroundColor: cursor.color,
                  boxShadow: `0 0 6px ${cursor.color}`
                }}
              />
              <div
                className="absolute -top-7 left-0 px-2 py-1 rounded-md text-xs text-white whitespace-nowrap font-medium shadow-lg"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
