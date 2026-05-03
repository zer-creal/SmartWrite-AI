// src/lib/mysql-config.js
// MySQL连接配置

const mysqlConfig = {
  // 使用共享内存连接，不用管TCP端口
  socketPath: '\\\\.\\pipe\\MySQL',
  user: 'root',
  password: 'mysql@123456', // root 密码
  database: 'smartwrite', // 数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

module.exports = mysqlConfig;
