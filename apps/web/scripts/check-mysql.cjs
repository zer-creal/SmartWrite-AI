// scripts/check-mysql.cjs
const mysql = require('mysql2/promise');

console.log('正在检查 MySQL 连接...\n');

// 尝试多个常用端口
const portsToTry = [3307, 3306, 3308, 3309];

async function checkPort(port) {
  try {
    console.log(`尝试连接端口 ${port}...`);
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: port,
      user: 'root',
      password: 'mysql@123456',
      connectTimeout: 3000
    });
    
    console.log(`✅ 端口 ${port} 连接成功！`);
    
    // 查看服务器版本
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`   MySQL 版本: ${rows[0].version}`);
    
    // 查看所有数据库
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log(`   现有数据库: ${databases.map(d => d.Database).join(', ')}`);
    
    await connection.end();
    return port;
  } catch (error) {
    console.log(`❌ 端口 ${port} 连接失败: ${error.code} - ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('检查服务状态...');
  try {
    // 这只是一个示例，实际检查服务状态需要更多权限
    console.log('请确保 "MySQL_ProjectA" 服务正在运行\n');
  } catch (e) {
    // 忽略
  }
  
  let connectedPort = null;
  for (const port of portsToTry) {
    connectedPort = await checkPort(port);
    if (connectedPort) {
      break;
    }
    console.log('');
  }
  
  if (connectedPort) {
    console.log(`\n✅ 找到可用的 MySQL 服务在端口 ${connectedPort}`);
    console.log('请更新 mysql-config.js 中的 port 配置！');
  } else {
    console.log('\n❌ 没有找到可用的 MySQL 服务');
    console.log('请检查：');
    console.log('1. 服务 "MySQL_ProjectA" 是否正在运行？');
    console.log('2. 端口配置是否正确？');
    console.log('3. 用户名和密码是否正确？');
  }
}

main();
