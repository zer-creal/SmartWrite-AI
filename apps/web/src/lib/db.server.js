// src/lib/db.js
// 数据库服务层 - 仅服务端使用

let dbService;

if (typeof window === 'undefined') {
  try {
    const { query } = require('./mysql.js');

    dbService = {
      createUser: async (data) => {
        const { id, email, name } = data;
        await query(
          'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
          [id, email, name]
        );
        return { id, email, name };
      },

      getUserByEmail: async (email) => {
        const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
      },

      createDocument: async (data) => {
        const { id, title, content, userId } = data;
        await query(
          'INSERT INTO documents (id, title, content, user_id) VALUES (?, ?, ?, ?)',
          [id, title, content, userId]
        );
        return { id, title, content, userId };
      },

      getDocumentsByUserId: async (userId) => {
        const rows = await query(
          'SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
          [userId]
        );
        return rows.map(row => ({
          id: row.id,
          title: row.title,
          content: row.content,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      },

      updateDocument: async (id, data) => {
        const { title, content } = data;
        const result = await query(
          'UPDATE documents SET title = ?, content = ? WHERE id = ?',
          [title, content, id]
        );
        return result.affectedRows > 0;
      },

      deleteDocument: async (id) => {
        const result = await query('DELETE FROM documents WHERE id = ?', [id]);
        return result.affectedRows > 0;
      },

      deleteDocuments: async (ids) => {
        if (ids.length === 0) return 0;
        const placeholders = ids.map(() => '?').join(',');
        const result = await query(
          `DELETE FROM documents WHERE id IN (${placeholders})`,
          ids
        );
        return result.affectedRows;
      }
    };

    console.log('✅ 使用 MySQL 数据库');
  } catch (error) {
    console.log('⚠️  MySQL 连接失败:', error.message);
    dbService = {
      createUser: async () => { throw new Error('MySQL 未配置'); },
      getUserByEmail: async () => { throw new Error('MySQL 未配置'); },
      createDocument: async () => { throw new Error('MySQL 未配置'); },
      getDocumentsByUserId: async () => { throw new Error('MySQL 未配置'); },
      updateDocument: async () => { throw new Error('MySQL 未配置'); },
      deleteDocument: async () => { throw new Error('MySQL 未配置'); },
      deleteDocuments: async () => { throw new Error('MySQL 未配置'); }
    };
  }
} else {
  dbService = {
    createUser: async () => { throw new Error('请通过 API 路由操作'); },
    getUserByEmail: async () => { throw new Error('请通过 API 路由操作'); },
    createDocument: async () => { throw new Error('请通过 API 路由操作'); },
    getDocumentsByUserId: async () => { throw new Error('请通过 API 路由操作'); },
    updateDocument: async () => { throw new Error('请通过 API 路由操作'); },
    deleteDocument: async () => { throw new Error('请通过 API 路由操作'); },
    deleteDocuments: async () => { throw new Error('请通过 API 路由操作'); }
  };
}

export default dbService;
