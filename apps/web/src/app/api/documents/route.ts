import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import mysqlConfig from '@/lib/mysql-config.js';
import { serverStorage } from '@/lib/server-storage';

// 生成唯一 ID
function generateId() {
  return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// 默认用户 ID
const DEFAULT_USER_ID = 'user-001';

// 尝试连接 MySQL
let mysqlAvailable: boolean | null = null;

async function checkMysqlAvailable() {
  if (mysqlAvailable !== null) return mysqlAvailable;
  
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    await connection.end();
    mysqlAvailable = true;
    console.log('✅ MySQL 可用，使用 MySQL 存储');
    return true;
  } catch (error) {
    mysqlAvailable = false;
    console.log('⚠️  MySQL 不可用，使用内存存储');
    return false;
  }
}

export async function GET() {
  try {
    const hasMysql = await checkMysqlAvailable();
    
    if (hasMysql) {
      // MySQL 模式
      const connection = await mysql.createConnection(mysqlConfig);
      const [documents] = await connection.execute(
        'SELECT id, title, created_at, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
        [DEFAULT_USER_ID]
      );
      await connection.end();
      return NextResponse.json(documents);
    } else {
      // 内存存储模式
      const documents = serverStorage.getDocuments();
      return NextResponse.json(documents);
    }
  } catch (error) {
    console.error('获取文档列表失败:', error);
    return NextResponse.json({ error: '获取文档列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title = '未命名文档', content = null } = await request.json();
    const hasMysql = await checkMysqlAvailable();
    
    if (hasMysql) {
      // MySQL 模式
      const docId = generateId();
      const connection = await mysql.createConnection(mysqlConfig);
      
      await connection.execute(
        'INSERT INTO documents (id, title, content, user_id) VALUES (?, ?, ?, ?)',
        [docId, title, JSON.stringify(content), DEFAULT_USER_ID]
      );
      
      const [documents] = await connection.execute(
        'SELECT id, title, created_at, updated_at FROM documents WHERE id = ?',
        [docId]
      );
      
      await connection.end();
      return NextResponse.json(documents[0], { status: 201 });
    } else {
      // 内存存储模式
      const doc = serverStorage.createDocument({ title, content });
      return NextResponse.json({
        id: doc.id,
        title: doc.title,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('创建文档失败:', error);
    return NextResponse.json({ error: '创建文档失败' }, { status: 500 });
  }
}
