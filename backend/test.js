const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'YxY13830268572!',
      database: 'campus_animal'
    });

    console.log('连接成功');

    const [rows] = await connection.query('SELECT * FROM animals');
    console.log('数据:', JSON.stringify(rows, null, 2));

    await connection.end();
    console.log('测试完成');
  } catch (error) {
    console.error('连接失败:', error.message);
  }
}

testConnection();