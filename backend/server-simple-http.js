const http = require('http');
const mysql = require('mysql2/promise');

let pool;

async function initDB() {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YxY13830268572!',
    database: 'campus_animal',
    waitForConnections: true,
    connectionLimit: 10
  });
  console.log('数据库连接池创建成功');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.url === '/api/stats') {
      const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM animals');
      const [speciesResult] = await pool.query('SELECT COUNT(DISTINCT species) as count FROM animals');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayResult] = await pool.query('SELECT COUNT(*) as count FROM animals WHERE DATE(created_at) = DATE(?)', [today]);
      
      res.end(JSON.stringify({
        totalAnimals: totalResult[0].count,
        speciesCount: speciesResult[0].count,
        todayAdd: todayResult[0].count,
        recognitions: 75
      }));
    } else if (req.url === '/api/animals') {
      const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC');
      const animals = rows.map(row => ({
        id: row.id,
        name: row.name,
        species: row.species,
        color: row.color,
        features: row.features,
        imageUrl: row.imageUrl,
        location: {
          latitude: parseFloat(row.location_lat),
          longitude: parseFloat(row.location_lng),
          address: row.location_address
        },
        createdAt: row.created_at
      }));
      res.end(JSON.stringify(animals));
    } else if (req.url === '/api/recognition/image') {
      const mockResults = [
        { species: '猫', color: '橘色', confidence: 0.95, features: '体型中等，耳朵竖立' },
        { species: '狗', color: '黄色', confidence: 0.88, features: '体型较大，四肢粗壮' },
        { species: '猫', color: '白色', confidence: 0.92, features: '蓝眼睛，长毛' }
      ];
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      res.end(JSON.stringify({ success: true, data: result }));
    } else {
      res.end(JSON.stringify({ message: 'API Server' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = 8888;

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});