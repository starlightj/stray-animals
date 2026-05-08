const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'campus_animal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.MYSQL_SSL === 'true' ? {
    minVersion: 'TLSv1.2'
  } : false
});

const initDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    await connection.query(`CREATE DATABASE IF NOT EXISTS campus_animal`);
    await connection.query(`USE campus_animal`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS animals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) DEFAULT '未命名',
        species VARCHAR(50) NOT NULL,
        color VARCHAR(50) NOT NULL,
        features TEXT,
        imageUrl VARCHAR(500) NOT NULL,
        location_lat DECIMAL(10, 6) NOT NULL,
        location_lng DECIMAL(10, 6) NOT NULL,
        location_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.query('SELECT COUNT(*) as count FROM animals');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO animals (name, species, color, features, imageUrl, location_lat, location_lng, location_address) VALUES
        ('大黄', '狗', '黄色', '体型较大，性格温顺，喜欢在图书馆前晒太阳', 'https://picsum.photos/400/300?random=1', 39.9042, 116.4074, '图书馆前'),
        ('小黑', '猫', '黑色', '经常在教学楼附近活动，喜欢翻找垃圾桶', 'https://picsum.photos/400/300?random=2', 39.9043, 116.4075, '教学楼旁'),
        ('小花', '猫', '花斑', '尾巴有白色斑块，性格粘人', 'https://picsum.photos/400/300?random=3', 39.9044, 116.4076, '食堂附近'),
        ('旺财', '狗', '棕色', '短毛，耳朵下垂', 'https://picsum.photos/400/300?random=4', 39.9045, 116.4077, '操场')
      `);
      console.log('初始数据已插入');
    }

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { pool, initDatabase };