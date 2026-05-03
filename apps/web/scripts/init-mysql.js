// scripts/init-mysql.js
import mysql from 'mysql2/promise';
import mysqlConfig from '../src/lib/mysql-config.js';

async function initDatabase() {
  console.log('开始初始化 MySQL 数据库...');

  try {
    // 1. 先不指定数据库连接，用于创建数据库
    const connection = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
    });

    console.log('✅ 成功连接到 MySQL 服务器');

    // 2. 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 "${mysqlConfig.database}" 创建成功`);

    // 3. 选择数据库
    await connection.execute(`USE \`${mysqlConfig.database}\``);
    console.log(`✅ 已选择数据库 "${mysqlConfig.database}"`);

    // 4. 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 用户表创建成功');

    // 5. 创建文档表
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
    console.log('✅ 文档表创建成功');

    // 6. 创建默认用户（如果不存在）
    const defaultUserId = 'user-001';
    const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [defaultUserId]);
    
    if (users.length === 0) {
      await connection.execute(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        [defaultUserId, 'demo@smartwrite.com', '演示用户']
      );
      console.log('✅ 默认用户创建成功');
    } else {
      console.log('✅ 默认用户已存在');
    }

    // 7. 关闭连接
    await connection.end();
    
    console.log('\n🎉 MySQL 数据库初始化完成！');
    console.log(`\n数据库信息：`);
    console.log(`- 主机: ${mysqlConfig.host}`);
    console.log(`- 端口: ${mysqlConfig.port}`);
    console.log(`- 数据库: ${mysqlConfig.database}`);
    console.log(`- 默认用户: demo@smartwrite.com`);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示：请确保 MySQL 服务已在端口 3307 上启动！');
    }
    process.exit(1);
  }
}

initDatabase();
