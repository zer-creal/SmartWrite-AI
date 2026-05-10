'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface File {
  id: string;
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

interface FileManagerContextType {
  files: File[];
  currentFileId: string | null;
  currentFile: File | null;
  createFile: () => Promise<File>;
  updateFile: (id: string, updates: Partial<File>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  setCurrentFileId: (id: string | null) => void;
  saveFileContent: (id: string, content: any) => Promise<void>;
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// 本地存储键名
const getFilesStorageKey = (userId: string) => `smartwrite_files_${userId}`;

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export function FileManagerProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const { user, isLoading: authIsLoading } = useAuth();

  const currentFile = files.find(f => f.id === currentFileId) || null;

  // 从本地存储获取文件列表
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        if (authIsLoading || !user) {
          setFiles([]);
          return;
        }
        
        const storageKey = getFilesStorageKey(user.id);
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          setFiles(JSON.parse(stored));
        } else {
          // 如果没有文件，创建一些示例文件
          const defaultFiles: File[] = [
            {
              id: generateId(),
              title: '欢迎使用 SmartWrite',
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: '欢迎使用 SmartWrite' }]
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '这是一个强大的智能写作平台，支持多人实时协作。' }]
                  },
                  {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: '主要功能' }]
                  },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '富文本编辑' }] }]
                      },
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '多人实时协作' }] }]
                      },
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Markdown 支持' }] }]
                      }
                    ]
                  },
                  {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: '使用技巧' }]
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '按 ' }, { type: 'text', marks: [{ type: 'code' }], text: '/' }, { type: 'text', text: ' 打开命令面板' }]
                  }
                ]
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: generateId(),
              title: '待办清单示例',
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: '今日任务' }]
                  },
                  {
                    type: 'taskList',
                    content: [
                      {
                        type: 'taskItem',
                        attrs: { checked: true },
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '完成项目文档' }] }]
                      },
                      {
                        type: 'taskItem',
                        attrs: { checked: false },
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '代码审查' }] }]
                      },
                      {
                        type: 'taskItem',
                        attrs: { checked: false },
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '团队会议' }] }]
                      }
                    ]
                  }
                ]
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ];
          setFiles(defaultFiles);
          localStorage.setItem(storageKey, JSON.stringify(defaultFiles));
        }
      } catch (error) {
        console.error('获取文件列表时发生错误:', error);
        setFiles([]);
      }
    };

    fetchFiles();
  }, [user, authIsLoading]);

  // 创建新文件
  const createFile = useCallback(async (): Promise<File> => {
    if (!user) {
      throw new Error('用户未登录，无法创建文档');
    }

    const newFile: File = {
      id: generateId(),
      title: '未命名文档',
      content: {
        type: 'doc',
        content: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageKey = getFilesStorageKey(user.id);
    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    localStorage.setItem(storageKey, JSON.stringify(updatedFiles));

    return newFile;
  }, [user, files]);

  // 更新文件
  const updateFile = useCallback(async (id: string, updates: Partial<File>) => {
    if (!user) {
      throw new Error('用户未登录，无法更新文档');
    }

    const updatedFiles = files.map(file =>
      file.id === id
        ? { ...file, ...updates, updatedAt: new Date().toISOString() }
        : file
    );

    const storageKey = getFilesStorageKey(user.id);
    setFiles(updatedFiles);
    localStorage.setItem(storageKey, JSON.stringify(updatedFiles));
  }, [user, files]);

  // 删除文件
  const deleteFile = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('用户未登录，无法删除文档');
    }

    const storageKey = getFilesStorageKey(user.id);
    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id);
      
      if (currentFileId === id) {
        if (newFiles.length > 0) {
          setCurrentFileId(newFiles[0].id);
        } else {
          setCurrentFileId(null);
        }
      }
      
      localStorage.setItem(storageKey, JSON.stringify(newFiles));
      return newFiles;
    });
  }, [currentFileId, user]);

  // 保存文件内容
  const saveFileContent = useCallback(async (id: string, content: any) => {
    await updateFile(id, { content });
  }, [updateFile]);

  return (
    <FileManagerContext.Provider
      value={{
        files,
        currentFileId,
        currentFile,
        createFile,
        updateFile,
        deleteFile,
        setCurrentFileId,
        saveFileContent,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
}

export function useFileManager() {
  const context = useContext(FileManagerContext);
  if (context === undefined) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
}
