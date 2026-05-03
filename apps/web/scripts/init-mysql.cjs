// scripts/init-mysql.cjs
const mysql = require('mysql2/promise');
const mysqlConfig = require('../src/lib/mysql-config.js');

async function initDatabase() {
  console.log('开始初始化 MySQL 数据库（通过共享内存）...\n');

  try {
    // 1. 先不指定数据库连接
    console.log('正在连接到 MySQL...');
    const connection = await mysql.createConnection({
      socketPath: mysqlConfig.socketPath,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
    });

    console.log('✅ 成功连接到 MySQL！\n');

    // 2. 创建数据库（如果不存在）
    console.log('正在创建数据库...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 "${mysqlConfig.database}" 准备就绪\n`);

    // 3. 选择数据库
    await connection.execute(`USE \`${mysqlConfig.database}\``);

    // 4. 创建用户表
    console.log('正在创建 users 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ users 表创建成功\n');

    // 5. 创建文档表
    console.log('正在创建 documents 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) DEFAULT '未命名文档',
        content JSON,
        user_id VARCHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ documents 表创建成功\n');

    // 6. 创建默认用户（如果不存在）
    const defaultUserId = 'user-001';
    const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [defaultUserId]);
    
    if (users.length === 0) {
      console.log('正在创建默认用户...');
      await connection.execute(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        [defaultUserId, 'demo@smartwrite.com', '演示用户']
      );
      console.log('✅ 默认用户创建成功\n');
    } else {
      console.log('✅ 默认用户已存在\n');
    }

    // 7. 关闭连接
    await connection.end();
    
    console.log('🎉 数据库初始化完成！');
    console.log('现在可以正常使用应用了！');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败！');
    console.error('错误代码:', error.code);
    console.error('错误信息:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示：请确保 MySQL_ProjectA 服务正在运行！');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 提示：用户名或密码错误！');
      console.error('请确认 my.ini 中的 skip-grant-tables 设置，或者重置密码。');
    }
    
    process.exit(1);
  }
}

initDatabase();
