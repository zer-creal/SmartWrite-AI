// scripts/check-mysql-files.cjs
const fs = require('fs');
const path = require('path');

const mysqlDir = 'D:/mySql_data_SAI';
const dataDir = path.join(mysqlDir, 'data');

console.log('检查 MySQL 目录结构...\n');

try {
  // 检查主目录
  console.log(`主目录: ${mysqlDir}`);
  if (fs.existsSync(mysqlDir)) {
    console.log('✅ 主目录存在');
    const files = fs.readdirSync(mysqlDir);
    console.log('  文件:', files);
  } else {
    console.log('❌ 主目录不存在');
  }

  console.log('');

  // 检查数据目录
  console.log(`数据目录: ${dataDir}`);
  if (fs.existsSync(dataDir)) {
    console.log('✅ 数据目录存在');
    const files = fs.readdirSync(dataDir);
    console.log('  文件:', files);

    // 查找错误日志
    const errFiles = files.filter(f => f.endsWith('.err'));
    if (errFiles.length > 0) {
      console.log(`\n✅ 找到错误日志: ${errFiles[0]}`);
      const errPath = path.join(dataDir, errFiles[0]);
      const errContent = fs.readFileSync(errPath, 'utf8');
      console.log('\n=== 错误日志末尾 ===');
      console.log(errContent.slice(-2000)); // 显示最后2000字符
    } else {
      console.log('\n⚠️ 没有找到 .err 错误日志文件');
    }
  } else {
    console.log('❌ 数据目录不存在');
  }

  // 检查 my.ini
  const myIniPath = path.join(mysqlDir, 'my.ini');
  console.log(`\n配置文件: ${myIniPath}`);
  if (fs.existsSync(myIniPath)) {
    console.log('✅ 配置文件存在');
    const content = fs.readFileSync(myIniPath, 'utf8');
    console.log('\n=== my.ini 内容 ===');
    console.log(content);
  } else {
    console.log('❌ 配置文件不存在');
  }

} catch (error) {
  console.error('错误:', error);
}
