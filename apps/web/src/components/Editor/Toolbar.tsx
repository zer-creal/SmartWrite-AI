'use client';

import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* 加粗按钮 */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive('bold')
            ? 'bg-slate-900 text-white'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        title="加粗"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h10a4 4 0 110 8H6v-8z" />
        </svg>
      </button>

      {/* 斜体按钮 */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive('italic')
            ? 'bg-slate-900 text-white'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        title="斜体"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* 无序列表按钮 */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-slate-900 text-white'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        title="无序列表"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 有序列表按钮 */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-slate-900 text-white'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        title="有序列表"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" />
        </svg>
      </button>
    </div>
  );
}
