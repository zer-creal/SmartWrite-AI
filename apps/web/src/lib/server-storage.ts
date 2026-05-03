// src/lib/server-storage.ts
// 服务器端文件存储（持久化，不用 MySQL 也能用！）

import fs from 'fs';
import path from 'path';

// 数据存储路径
const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 默认用户
const DEFAULT_USER_ID = 'user-001';
const DEFAULT_USER = {
  id: DEFAULT_USER_ID,
  email: 'demo@smartwrite.com',
  name: '演示用户',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// 内存缓存
let users: Map<string, any> = new Map();
let documents: Map<string, any> = new Map();

// 从文件加载数据
function loadFromDisk() {
  ensureDataDir();
  
  // 加载用户
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      users = new Map(Object.entries(data));
    } catch (e) {
      console.error('加载用户数据失败:', e);
    }
  }
  
  // 加载文档
  if (fs.existsSync(DOCUMENTS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DOCUMENTS_FILE, 'utf-8'));
      documents = new Map(Object.entries(data));
    } catch (e) {
      console.error('加载文档数据失败:', e);
    }
  }
  
  // 初始化默认用户
  if (!users.has(DEFAULT_USER_ID)) {
    users.set(DEFAULT_USER_ID, DEFAULT_USER);
    saveUsers();
  }
}

// 保存用户到文件
function saveUsers() {
  ensureDataDir();
  const data = Object.fromEntries(users);
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// 保存文档到文件
function saveDocuments() {
  ensureDataDir();
  const data = Object.fromEntries(documents);
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(data, null, 2));
}

// 初始化
loadFromDisk();
console.log('✅ 数据存储已初始化（文件系统）');

// 生成唯一 ID
function generateId() {
  return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// 文档存储
export const serverStorage = {
  // 获取用户的所有文档
  getDocuments(userId = DEFAULT_USER_ID) {
    const docs = [];
    documents.forEach((doc) => {
      if (doc.user_id === userId) {
        docs.push({
          id: doc.id,
          title: doc.title,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        });
      }
    });
    return docs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  // 获取单个文档
  getDocument(docId: string) {
    return documents.get(docId) || null;
  },

  // 创建文档
  createDocument({ title = '未命名文档', content = null }, userId = DEFAULT_USER_ID) {
    const id = generateId();
    const now = new Date().toISOString();
    const doc = {
      id,
      title,
      content,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    documents.set(id, doc);
    saveDocuments();
    return doc;
  },

  // 更新文档
  updateDocument(docId: string, { title, content }: { title?: string; content?: any }) {
    const doc = documents.get(docId);
    if (!doc) return null;
    
    const updated = {
      ...doc,
      title: title !== undefined ? title : doc.title,
      content: content !== undefined ? content : doc.content,
      updated_at: new Date().toISOString(),
    };
    documents.set(docId, updated);
    saveDocuments();
    return updated;
  },

  // 删除文档
  deleteDocument(docId: string) {
    const deleted = documents.delete(docId);
    if (deleted) {
      saveDocuments();
    }
    return deleted;
  },
};
