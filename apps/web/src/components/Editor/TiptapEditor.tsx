'use client';

import './editor-styles.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFileManager } from '@/context/FileManagerContext';

interface TiptapEditorProps {
  docId: string;
}

export default function TiptapEditor({ docId }: TiptapEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [docTitle, setDocTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { files, updateFile, loadFileContent } = useFileManager();
  const router = useRouter();

  const editorRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const contentLoadedRef = useRef(false);

  const currentFile = files.find(f => f.id === docId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
            depth: 100,
            newGroupDelay: 50,
          },
      }),
      Placeholder.configure({
        placeholder: '开始写点什么...',
      }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      editorRef.current = e;
      debouncedSave();
    },
  });

  useEffect(() => {
    contentLoadedRef.current = false;
  }, [docId]);

  // 加载文档内容
  useEffect(() => {
    if (!docId || !editor) return;
    
    const loadContent = async () => {
      setIsLoading(true);
      const file = await loadFileContent(docId);
      if (file && editor) {
        contentLoadedRef.current = true;
        if (file.content) {
          editor.commands.setContent(file.content, false);
        } else {
          editor.commands.clearContent();
        }
        setDocTitle(file.title || '未命名文档');
      }
      setIsLoading(false);
    };

    loadContent();
  }, [docId, editor, loadFileContent]);

  const debouncedSave = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [docId, user]);

  const handleSave = useCallback(async () => {
    if (!docId || !user) return;
    const e = editorRef.current;
    if (!e) return;

    const content = e.getJSON();
    setSaveStatus('saving');
    try {
      await updateFile(docId, { content });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('idle');
    }
  }, [docId, user]);

  const handleManualSave = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    handleSave();
  }, [handleSave]);

  const handleSaveTitle = useCallback(async () => {
    if (!docId || !docTitle.trim() || !user) return;
    try {
      await updateFile(docId, { title: docTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('保存标题失败:', error);
    }
  }, [docId, docTitle, user]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  if (!editor || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 mb-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setDocTitle(currentFile?.title || '未命名文档');
                  }
                }}
                autoFocus
                className="flex-1 text-xl font-semibold border-none outline-none bg-transparent"
              />
            ) : (
              <h1
                className="flex-1 text-xl font-semibold text-gray-900 cursor-text hover:bg-gray-50 px-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {docTitle}
              </h1>
            )}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-sm text-gray-500">保存中...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600">已保存</span>
              )}
              <button
                onClick={handleManualSave}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="保存"
              >
                <Save className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 border-t border-gray-100 pt-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="粗体"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="标题1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="标题2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('bulletList') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('orderedList') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
