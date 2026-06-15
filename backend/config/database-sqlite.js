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

  // ====== 领养申请表 ======
  db.exec(`
    CREATE TABLE IF NOT EXISTS adoptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      adopter_name TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      reason TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT '待审核',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (animal_id) REFERENCES animals(id)
    )
  `);

  // ====== 评论表 ======
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      nickname TEXT NOT NULL DEFAULT '匿名用户',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (animal_id) REFERENCES animals(id)
    )
  `);

  console.log('✅ 领养/评论表创建成功');

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

    console.log('✅ 初始动物数据已插入');
  }

  // 插入评论示例数据（评论表为空时执行）
  const commentCount = db.prepare('SELECT COUNT(*) AS count FROM comments').get();
  if (commentCount.count === 0) {
    const animals = db.prepare('SELECT id, name FROM animals ORDER BY id ASC LIMIT 4').all();
    if (animals.length >= 4) {
      const ci = db.prepare('INSERT INTO comments (animal_id, nickname, content, created_at) VALUES (?, ?, ?, ?)');
      ci.run(animals[0].id, '爱宠小分队', `${animals[0].name}性格真的很温顺，经常在图书馆门口晒太阳，很多同学都喜欢它`, '2026-06-01 10:30:00');
      ci.run(animals[0].id, '图书馆管理员', `${animals[0].name}已经在附近生活两年了，很乖不咬人`, '2026-06-02 14:20:00');
      ci.run(animals[0].id, '学生小明', '我经常带食物喂它，它现在认识我了哈哈', '2026-06-03 09:15:00');
      ci.run(animals[1].id, '猫猫爱好者', `${animals[1].name}特别机灵，虽然有点怕人但从不伤人`, '2026-06-01 16:00:00');
      ci.run(animals[1].id, '保安大叔', '晚上经常在教学楼门口等学生下自习，很暖心', '2026-06-04 20:30:00');
      ci.run(animals[2].id, '食堂阿姨', '经常在食堂附近转悠，我给过它好几次吃的', '2026-06-02 11:45:00');
      ci.run(animals[2].id, '学生小芳', '超级粘人，一叫就过来蹭你，心都化了', '2026-06-05 18:00:00');
      ci.run(animals[3].id, '体育老师', '经常在操场上跑步的学生旁边跟着跑，特别有活力', '2026-06-03 07:20:00');
      console.log('✅ 评论示例数据已插入');
    }
  }

  // 插入领养示例数据（领养表为空时执行）
  const adoptCount = db.prepare('SELECT COUNT(*) AS count FROM adoptions').get();
  if (adoptCount.count === 0) {
    const animals = db.prepare('SELECT id, name FROM animals ORDER BY id ASC LIMIT 4').all();
    if (animals.length >= 3) {
      const ai = db.prepare('INSERT INTO adoptions (animal_id, adopter_name, contact, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      ai.run(animals[0].id, '张同学', '138****1234', `很喜欢${animals[0].name}，想给它一个温暖的家`, '待审核', '2026-06-05 15:00:00');
      ai.run(animals[2].id, '李老师', '139****5678', '家里有院子，可以让它自由活动', '已通过', '2026-06-03 10:30:00');
      console.log('✅ 领养示例数据已插入');
    }
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
