'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
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

export function FileManagerProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useAuth();

  console.log('FileManagerProvider user:', user);
  console.log('FileManagerProvider authIsLoading:', authIsLoading);

  const currentFile = files.find(f => f.id === currentFileId) || null;

  // 从 Supabase 获取文件列表
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        // 如果认证状态正在加载，不尝试获取文件列表
        if (authIsLoading) {
          console.log('Auth is loading, skipping file fetch');
          setIsLoading(false);
          return;
        }
        
        // 如果用户未登录，显示空列表
        if (!user) {
          console.log('User not logged in, setting files to empty');
          setFiles([]);
          setIsLoading(false);
          return;
        }
        
        console.log('User logged in, fetching files for user:', user.id);
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('获取文件列表失败:', error);
          setFiles([]);
        } else if (data) {
          setFiles(data);
        }
      } catch (error) {
        console.error('获取文件列表时发生错误:', error);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [user, authIsLoading]);

  // 创建新文件
  const createFile = useCallback(async (): Promise<File> => {
    console.log('createFile function called');
    try {
      // 确保用户已登录
      if (!user) {
        console.error('用户未登录，无法创建文档');
        throw new Error('用户未登录，无法创建文档');
      }
      
      console.log('Creating new document for user:', user.id, user.email);
      
      // 检查当前认证状态
      const { data, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check result:', { data, sessionError });
      
      if (sessionError) {
        console.error('Session check error:', sessionError);
        throw new Error('用户会话检查失败，无法创建文档');
      }
      
      const session = data?.session;
      console.log('Current session:', session);
      
      if (!session) {
        console.error('用户会话不存在，无法创建文档');
        throw new Error('用户会话不存在，无法创建文档');
      }
      
      console.log('Session user:', session.user);
      console.log('Session user ID:', session.user.id);
      console.log('Context user ID:', user.id);
      console.log('Are user IDs matching:', session.user.id === user.id);
      
      // 手动传递 user_id，确保与当前用户匹配
      const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: '未命名文档',
          content: '',
          user_id: user.id, // 手动传递 user_id
        })
        .select()
        .single();
      
      console.log('Create document response:', { insertData, insertError });
      
      if (insertError) {
        console.error('创建文件失败:', insertError);
        // 将错误对象转换为具有 code 属性的对象
        const errorWithCode = {
          ...insertError,
          code: insertError.code || 'UNKNOWN_ERROR'
        };
        throw errorWithCode;
      }
      
      const newFile: File = {
        id: insertData.id,
        title: insertData.title,
        content: insertData.content,
        createdAt: insertData.created_at,
        updatedAt: insertData.updated_at,
      };
      
      setFiles(prev => [newFile, ...prev]);
      return newFile;
    } catch (error) {
      console.error('创建文件时发生错误:', error);
      throw error;
    }
  }, [user]);

  // 更新文件
  const updateFile = useCallback(async (id: string, updates: Partial<File>) => {
    try {
      // 确保用户已登录
      if (!user) {
        throw new Error('用户未登录，无法更新文档');
      }
      
      const { error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('更新文件失败:', error);
        throw error;
      }
      
      setFiles(prev => prev.map(file => 
        file.id === id 
          ? { ...file, ...updates, updatedAt: new Date().toISOString() }
          : file
      ));
    } catch (error) {
      console.error('更新文件时发生错误:', error);
      throw error;
    }
  }, [user]);

  // 删除文件
  const deleteFile = useCallback(async (id: string) => {
    try {
      // 确保用户已登录
      if (!user) {
        throw new Error('用户未登录，无法删除文档');
      }
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('删除文件失败:', error);
        throw error;
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
    } catch (error) {
      console.error('删除文件时发生错误:', error);
      throw error;
    }
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
