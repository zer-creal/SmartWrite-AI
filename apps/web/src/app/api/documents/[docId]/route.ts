import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import mysqlConfig from '@/lib/mysql-config.js';
import { serverStorage } from '@/lib/server-storage';

const DEFAULT_USER_ID = 'user-001';

// 尝试连接 MySQL
let mysqlAvailable: boolean | null = null;

async function checkMysqlAvailable() {
  if (mysqlAvailable !== null) return mysqlAvailable;
  
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    await connection.end();
    mysqlAvailable = true;
    return true;
  } catch (error) {
    mysqlAvailable = false;
    return false;
  }
}

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  const { docId } = params;
  
  try {
    const hasMysql = await checkMysqlAvailable();
    
    if (hasMysql) {
      // MySQL 模式
      const connection = await mysql.createConnection(mysqlConfig);
      const [documents] = await connection.execute(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?',
        [docId, DEFAULT_USER_ID]
      );
      await connection.end();
      
      if (documents.length === 0) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      
      const doc = documents[0] as any;
      if (doc.content && typeof doc.content === 'string') {
        doc.content = JSON.parse(doc.content);
      }
      return NextResponse.json(doc);
    } else {
      // 内存存储模式
      const doc = serverStorage.getDocument(docId);
      if (!doc) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      return NextResponse.json(doc);
    }
  } catch (error) {
    console.error('获取文档失败:', error);
    return NextResponse.json({ error: '获取文档失败' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { docId: string } }) {
  const { docId } = params;
  
  try {
    const { title, content } = await request.json();
    const hasMysql = await checkMysqlAvailable();
    
    if (hasMysql) {
      // MySQL 模式
      const connection = await mysql.createConnection(mysqlConfig);
      
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      
      if (content !== undefined) {
        updates.push('content = ?');
        values.push(JSON.stringify(content));
      }
      
      if (updates.length === 0) {
        await connection.end();
        return NextResponse.json({ error: '没有更新内容' }, { status: 400 });
      }
      
      values.push(docId);
      values.push(DEFAULT_USER_ID);
      
      await connection.execute(
        `UPDATE documents SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );
      
      const [documents] = await connection.execute(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?',
        [docId, DEFAULT_USER_ID]
      );
      
      await connection.end();
      
      const doc = documents[0] as any;
      if (doc.content && typeof doc.content === 'string') {
        doc.content = JSON.parse(doc.content);
      }
      
      return NextResponse.json(doc);
    } else {
      // 内存存储模式
      const doc = serverStorage.updateDocument(docId, { title, content });
      if (!doc) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      return NextResponse.json(doc);
    }
  } catch (error) {
    console.error('更新文档失败:', error);
    return NextResponse.json({ error: '更新文档失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { docId: string } }) {
  const { docId } = params;
  
  try {
    const hasMysql = await checkMysqlAvailable();
    
    if (hasMysql) {
      // MySQL 模式
      const connection = await mysql.createConnection(mysqlConfig);
      const [result] = await connection.execute(
        'DELETE FROM documents WHERE id = ? AND user_id = ?',
        [docId, DEFAULT_USER_ID]
      );
      await connection.end();
      
      const resultAny = result as any;
      if (resultAny.affectedRows === 0) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true });
    } else {
      // 内存存储模式
      const deleted = serverStorage.deleteDocument(docId);
      if (!deleted) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json({ error: '删除文档失败' }, { status: 500 });
  }
}
