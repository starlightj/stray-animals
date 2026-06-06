/**
 * SQLite 数据库模块
 * 
 * 替代 MySQL/TiDB 的零配置方案。
 * 使用 better-sqlite3，数据存储在 campus_animal.db 文件中。
 * 无需安装数据库服务器，无需配置连接信息。
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'campus_animal.db');

let db;

/**
 * 初始化 SQLite 数据库
 * - 创建数据库文件（如果不存在）
 * - 创建 animals 表（如果不存在）
 * - 插入初始示例数据（如果表为空）
 */
function initDatabase() {
  console.log('SQLite 数据库路径:', DB_PATH);

  db = new Database(DB_PATH);

  // 启用 WAL 模式提升并发性能
  db.pragma('journal_mode = WAL');

  // 创建表（兼容原有 MySQL schema）
  db.exec(`
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '未命名',
      species TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '',
      features TEXT DEFAULT '',
      imageUrl TEXT NOT NULL DEFAULT '',
      animal_type TEXT DEFAULT NULL,
      location_lat REAL DEFAULT 0,
      location_lng REAL DEFAULT 0,
      location_address TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 插入初始示例数据
  const row = db.prepare('SELECT COUNT(*) AS count FROM animals').get();
  if (row.count === 0) {
    const insert = db.prepare(`
      INSERT INTO animals (name, species, color, features, imageUrl, location_lat, location_lng, location_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run('大黄', '狗', '黄色', '体型较大，性格温顺，喜欢在图书馆前晒太阳', 'https://picsum.photos/400/300?random=1', 39.9042, 116.4074, '图书馆前');
    insert.run('小黑', '猫', '黑色', '经常在教学楼附近活动，喜欢翻找垃圾桶', 'https://picsum.photos/400/300?random=2', 39.9043, 116.4075, '教学楼旁');
    insert.run('小花', '猫', '花斑', '尾巴有白色斑块，性格粘人', 'https://picsum.photos/400/300?random=3', 39.9044, 116.4076, '食堂附近');
    insert.run('旺财', '狗', '棕色', '短毛，耳朵下垂', 'https://picsum.photos/400/300?random=4', 39.9045, 116.4077, '操场');

    console.log('✅ 初始示例数据已插入');
  }

  console.log('✅ SQLite 数据库初始化成功');
  return db;
}

/**
 * 兼容 mysql2/promise 的 query 接口
 * 
 * 用法示例：
 *   const [rows] = await pool.query('SELECT * FROM animals');
 *   const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [id]);
 *   const [result] = await pool.query('INSERT INTO animals (...) VALUES (...)');
 *   // result.insertId  /  result.affectedRows
 */
async function query(sql, params = []) {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }

  const trimmedSql = sql.trim().toUpperCase();

  // SELECT / WITH 查询 → 返回行数组
  if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('WITH')) {
    const stmt = db.prepare(sql);
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
    return [rows];
  }

  // INSERT 查询 → 返回 insertId 和 affectedRows
  if (trimmedSql.startsWith('INSERT')) {
    const stmt = db.prepare(sql);
    const info = params.length > 0 ? stmt.run(...params) : stmt.run();
    return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }];
  }

  // UPDATE / DELETE / CREATE 等
  const stmt = db.prepare(sql);
  const info = params.length > 0 ? stmt.run(...params) : stmt.run();
  return [{ affectedRows: info.changes }];
}

/**
 * 关闭数据库连接
 */
function close() {
  if (db) {
    db.close();
    console.log('数据库连接已关闭');
  }
}

module.exports = {
  pool: { query },
  initDatabase,
  close,
  getDb: () => db
};
