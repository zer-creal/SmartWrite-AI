'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { textblockTypeInputRule, Extension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { 
  Bold, 
  Italic, 
  Sparkles,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  CheckSquare,
  X,
  Upload,
  Quote,
  Minus,
  FileText,
  Hash,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFileManager } from '@/context/FileManagerContext';
import { common, createLowlight } from 'lowlight';
import './editor-styles.css';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  docId: string;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const COMMANDS: CommandItem[] = [
  { id: 'heading1', title: '标题 1', description: '大标题', icon: <Heading1 className="w-4 h-4" /> },
  { id: 'heading2', title: '标题 2', description: '中标题', icon: <Heading2 className="w-4 h-4" /> },
  { id: 'heading3', title: '标题 3', description: '小标题', icon: <Heading3 className="w-4 h-4" /> },
  { id: 'bold', title: '粗体', description: '**文字**', icon: <Bold className="w-4 h-4" /> },
  { id: 'italic', title: '斜体', description: '*文字*', icon: <Italic className="w-4 h-4" /> },
  { id: 'bulletList', title: '无序列表', description: '项目符号', icon: <List className="w-4 h-4" /> },
  { id: 'orderedList', title: '有序列表', description: '编号列表', icon: <ListOrdered className="w-4 h-4" /> },
  { id: 'taskList', title: '待办清单', description: '勾选框列表', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'code', title: '代码块', description: '代码高亮', icon: <Code className="w-4 h-4" /> },
  { id: 'quote', title: '引用', description: '引用块', icon: <Quote className="w-4 h-4" /> },
  { id: 'divider', title: '分割线', description: '---', icon: <Minus className="w-4 h-4" /> },
  { id: 'page', title: '新页面', description: '创建页面', icon: <FileText className="w-4 h-4" /> },
  { id: 'ai', title: 'AI 助手', description: '智能写作辅助', icon: <Sparkles className="w-4 h-4" /> },
];

export default function TiptapEditor({ docId }: TiptapEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const { user } = useAuth();
  const { files, saveFileContent } = useFileManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const currentFile = files.find(f => f.id === docId);

  const MarkdownInputRules = Extension.create({
    name: 'markdownInputRules',
    addInputRules() {
      return [
        // # 空格 → H1 标题
        textblockTypeInputRule({
          find: /^# $/,
          type: this.editor.schema.nodes.heading,
          getAttributes: () => ({ level: 1 }),
        }),
        // ## 空格 → H2 标题
        textblockTypeInputRule({
          find: /^## $/,
          type: this.editor.schema.nodes.heading,
          getAttributes: () => ({ level: 2 }),
        }),
        // ### 空格 → H3 标题
        textblockTypeInputRule({
          find: /^### $/,
          type: this.editor.schema.nodes.heading,
          getAttributes: () => ({ level: 3 }),
        }),
        // > 空格 → 引用块
        textblockTypeInputRule({
          find: /^> $/,
          type: this.editor.schema.nodes.blockquote,
        }),
        // - 空格 → 无序列表
        textblockTypeInputRule({
          find: /^- $/,
          type: this.editor.schema.nodes.bulletList,
        }),
        // 1. 空格 → 有序列表
        textblockTypeInputRule({
          find: /^(\d+)\. $/,
          type: this.editor.schema.nodes.orderedList,
          getAttributes: (match) => ({ start: parseInt(match[1], 10) }),
        }),
      ];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      MarkdownInputRules,
      Placeholder.configure({
        placeholder: "输入 '/' 查看命令，或使用 Markdown 快捷语法（# ## ### > - 1.）",
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-blue-500 underline hover:text-blue-700' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: 'rounded-lg bg-slate-900 text-slate-50 p-4 my-4 overflow-x-auto' },
      }),
      TaskList.configure({
        HTMLAttributes: { class: 'not-prose pl-0' },
      }),
      TaskItem.configure({
        HTMLAttributes: { class: 'flex items-start gap-2 my-1' },
        nested: true,
      }),
      Typography,
    ],
    content: currentFile?.content || '',
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        if (editor && docId) {
          const content = editor.getJSON();
          saveFileContent(docId, content).then(() => setIsSaving(false)).catch(() => setIsSaving(false));
        }
      }, 1000);
    },
  });

  useEffect(() => {
    if (editor) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!editor) return;

        // 处理 / 命令面板
        if (event.key === '/' && !editor.isActive('code') && !editor.isActive('codeBlock')) {
          event.preventDefault();
          setCommandSearch('');
          setShowCommandMenu(true);
        }

        // 按 ESC 关闭命令面板
        if (event.key === 'Escape') {
          setShowCommandMenu(false);
        }
      };

      editor.view.dom.addEventListener('keydown', handleKeyDown);
      return () => {
        editor.view.dom.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editor]);

  const filteredCommands = useMemo(() => {
    if (!commandSearch) return COMMANDS;
    const searchLower = commandSearch.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.title.toLowerCase().includes(searchLower) || 
      cmd.description.toLowerCase().includes(searchLower)
    );
  }, [commandSearch]);

  const handleCommand = useCallback((commandId: string) => {
    if (!editor) return;
    editor.view.dom.focus();
    
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    
    if ($from.pos > 0) {
      const textBefore = state.doc.textBetween(Math.max(0, $from.pos - 1), $from.pos);
      if (textBefore === '/') {
        editor.chain().focus().deleteRange({ from: $from.pos - 1, to: $from.pos }).run();
      }
    }
    
    setTimeout(() => {
      if (!editor) return;
      
      switch (commandId) {
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'bold':
          editor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'taskList':
          editor.chain().focus().toggleTaskList().run();
          break;
        case 'code':
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case 'quote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'divider':
          editor.chain().focus().setHorizontalRule().run();
          break;
        case 'page':
          console.log('创建新页面');
          break;
        case 'ai':
          console.log('AI 助手');
          break;
      }
    }, 10);
    
    setShowCommandMenu(false);
  }, [editor]);

  const handleManualSave = useCallback(async () => {
    if (!editor || !docId) return;
    try {
      setIsSaving(true);
      const content = editor.getJSON();
      await saveFileContent(docId, content);
      setIsSaving(false);
    } catch (error) {
      console.error('手动保存失败:', error);
      setIsSaving(false);
    }
  }, [editor, docId, saveFileContent]);

  const insertImage = useCallback((src: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src }).run();
    }
  }, [editor]);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    insertImage(objectUrl);
    console.log('🖼️ 图片已插入:', file.name);
  }, [insertImage]);

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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      setShowImageModal(false);
    }
  }, [handleFileUpload]);

  const openImageModal = useCallback(() => {
    setShowImageModal(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

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

  const toggleCodeBlock = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  }, [editor]);

  const toggleTaskList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleTaskList().run();
    }
  }, [editor]);

  useEffect(() => {
    if (editor && currentFile) {
      editor.commands.setContent(currentFile.content || '', false);
    }
  }, [editor, currentFile]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">编辑器加载中...</div>
      </div>
    );
  }

  const commands = filteredCommands;

  return (
    <div className="relative max-w-3xl mx-auto">
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
        
        <div className="flex items-center gap-1">
          <button onClick={openImageModal} className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors" title="插入图片">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button onClick={addLink} className={`p-2 rounded-md transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`} title="插入链接">
            <LinkIcon className="w-4 h-4" />
          </button>
          <button onClick={toggleCodeBlock} className={`p-2 rounded-md transition-colors ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`} title="代码块">
            <Code className="w-4 h-4" />
          </button>
          <button onClick={toggleTaskList} className={`p-2 rounded-md transition-colors ${editor.isActive('taskList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`} title="待办清单">
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button onClick={handleManualSave} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">插入图片</h3>
              <button onClick={closeImageModal} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">拖拽图片到此处，或</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  选择文件
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
              <div className="text-center text-xs text-gray-500">支持 JPG、PNG、GIF、WebP 格式</div>
            </div>
          </div>
        </div>
      )}

      {showCommandMenu && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-center pt-24 z-50" onClick={() => setShowCommandMenu(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-96 max-h-96 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Hash className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                placeholder="搜索命令..."
                className="flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
              <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            
            <div className="overflow-y-auto max-h-72">
              {commands.length > 0 ? (
                commands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommand(cmd.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-gray-50' : ''}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                      {cmd.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{cmd.title}</div>
                      <div className="text-xs text-gray-500">{cmd.description}</div>
                    </div>
                    {index === 0 && (
                      <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Enter</kbd>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">未找到匹配的命令</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="relative">
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100/50 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <p className="text-blue-600 font-medium">释放以上传图片</p>
            </div>
          </div>
        )}

        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, arrow: false, offset: [0, 8] }}
          className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="粗体 (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="斜体 (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-md transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="标题 1">
            <Heading1 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-md transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="标题 2">
            <Heading2 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-md transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="标题 3">
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="无序列表">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="有序列表">
            <ListOrdered className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('taskList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="待办清单">
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={addLink} className={`p-2 rounded-md transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="插入链接">
            <LinkIcon className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="行内代码">
            <Code className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-md transition-colors ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} title="引用">
            <Quote className="w-4 h-4" />
          </button>
        </BubbleMenu>

        <EditorContent editor={editor} className="prose prose-gray max-w-none" />
      </div>
    </div>
  );
}
