// scripts/test-shared-memory.cjs
const mysql = require('mysql2/promise');

console.log('尝试通过共享内存连接 MySQL...\n');

async function testSharedMemory() {
  try {
    // 尝试用 shared memory 连接
    console.log('尝试连接 (共享内存模式)...');
    const connection = await mysql.createConnection({
      socketPath: '\\\\.\\pipe\\MySQL',
      user: 'root',
      password: 'mysql@123456',
      connectTimeout: 5000
    });
    
    console.log('✅ 共享内存连接成功！');
    
    // 查看状态
    const [status] = await connection.execute('SHOW VARIABLES LIKE "port"');
    console.log('当前端口:', status[0]?.Value || '未知');
    
    const [status2] = await connection.execute('SHOW VARIABLES LIKE "socket"');
    console.log('socket:', status2[0]?.Value || '未知');
    
    await connection.end();
    return true;
  } catch (error) {
    console.log('共享内存连接失败:', error.code, error.message);
    return false;
  }
}

async function testLocalhost() {
  // 尝试几个常见的 pipe 名称
  const pipes = [
    '\\\\.\\pipe\\MySQL',
    '\\\\.\\pipe\\MySQL_ProjectA',
  ];
  
  for (const pipe of pipes) {
    try {
      console.log(`\n尝试 pipe: ${pipe}`);
      const connection = await mysql.createConnection({
        socketPath: pipe,
        user: 'root',
        password: 'mysql@123456',
        connectTimeout: 3000
      });
      
      console.log('✅ 连接成功！');
      
      // 看看有什么数据库
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('数据库:', databases.map(d => d.Database));
      
      await connection.end();
      return pipe;
    } catch (e) {
      console.log('失败:', e.code);
    }
  }
  
  return null;
}

async function main() {
  // 先尝试共享内存
  const connected = await testLocalhost();
  
  if (connected) {
    console.log(`\n🎉 成功通过 pipe 连接: ${connected}`);
    console.log('我们可以用这个方式来设置密码和配置！');
  } else {
    console.log('\n❌ 所有连接方式都失败了');
    console.log('让我们查看一下最新的错误日志...');
  }
}

main();
