'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  isLoading: boolean;
  createFile: () => Promise<File>;
  updateFile: (id: string, updates: Partial<File>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  deleteFiles: (ids: string[]) => Promise<void>;
  setCurrentFileId: (id: string | null) => void;
  saveFileContent: (id: string, content: any) => Promise<void>;
  loadFileContent: (id: string) => Promise<File | null>;
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// 转换 API 返回的字段名为前端使用的字段名
function transformFileFromApi(file: any): File {
  return {
    id: file.id,
    title: file.title,
    content: file.content,
    createdAt: file.created_at,
    updatedAt: file.updated_at,
  };
}

export function FileManagerProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastCreateAttemptRef = useRef<number>(0);
  const { user } = useAuth();

  const currentFile = files.find(f => f.id === currentFileId) || null;

  // 从 API 加载文件列表
  const loadFiles = useCallback(async () => {
    if (!user) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.map(transformFileFromApi));
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 从 API 加载单个文件的完整内容
  const loadFileContent = useCallback(async (id: string): Promise<File | null> => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        const file = transformFileFromApi(data);
        
        // 更新文件列表中的内容
        setFiles(prev => prev.map(f => f.id === id ? file : f));
        return file;
      }
      return null;
    } catch (error) {
      console.error('加载文件内容失败:', error);
      return null;
    }
  }, []);

  const createFile = useCallback(async (): Promise<File> => {
    const now = Date.now();

    if (now - lastCreateAttemptRef.current < 300) {
      return files[0] || null;
    }

    lastCreateAttemptRef.current = now;

    if (!user) {
      throw new Error('用户未登录，无法创建文档');
    }

    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '未命名文档', content: null }),
    });

    if (!response.ok) {
      throw new Error('创建文档失败');
    }

    const newFile = transformFileFromApi(await response.json());
    
    setFiles(prev => [newFile, ...prev]);
    return newFile;
  }, [user, files]);

  const updateFile = useCallback(async (id: string, updates: Partial<File>) => {
    if (!user) {
      throw new Error('用户未登录，无法更新文档');
    }

    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('更新文档失败');
    }

    const updatedFile = transformFileFromApi(await response.json());
    
    setFiles(prev => prev.map(file =>
      file.id === id ? updatedFile : file
    ));
  }, [user]);

  const deleteFile = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('用户未登录，无法删除文档');
    }

    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('删除文档失败');
    }

    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id);

      if (currentFileId === id) {
        if (newFiles.length > 0) {
          setCurrentFileId(newFiles[0].id);
        } else {
          setCurrentFileId(null);
        }
      }

      return newFiles;
    });
  }, [currentFileId, user]);

  const deleteFiles = useCallback(async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    for (const id of ids) {
      try {
        await deleteFile(id);
      } catch (error) {
        console.error(`删除文件 ${id} 失败:`, error);
      }
    }
  }, [user, deleteFile]);

  const saveFileContent = useCallback(async (id: string, content: any) => {
    await updateFile(id, { content });
  }, [updateFile]);

  return (
    <FileManagerContext.Provider
      value={{
        files,
        currentFileId,
        currentFile,
        isLoading,
        createFile,
        updateFile,
        deleteFile,
        deleteFiles,
        setCurrentFileId,
        saveFileContent,
        loadFileContent,
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
