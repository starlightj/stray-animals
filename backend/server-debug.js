const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const logFile = fs.createWriteStream('server.log', { flags: 'a' });

function log(msg) {
  logFile.write(new Date().toISOString() + ' - ' + msg + '\n');
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log('Uncaught Exception: ' + err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log('Unhandled Rejection: ' + reason);
});

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let pool;

async function initDB() {
  try {
    const sslConfig = process.env.MYSQL_SSL === 'true' ? {
      ca: fs.readFileSync('./isrgrootx1.pem'),
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    } : undefined;
    
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true
    });
    log('数据库连接池创建成功');

    const connection = await pool.getConnection();
    log('数据库连接测试成功');
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS campus_animal`);
    log('数据库创建成功');
    
    await connection.execute(`USE campus_animal`);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS animals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        species VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        features TEXT,
        imageUrl VARCHAR(255),
        location_lat DECIMAL(10,7),
        location_lng DECIMAL(10,7),
        location_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('表创建成功');
    
    connection.release();
    
    pool.end();
    
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'campus_animal',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true
    });
    log('连接池重新配置成功');
  } catch (error) {
    log('数据库初始化错误: ' + error.stack);
    throw error;
  }
}

app.get('/api/stats', async (req, res) => {
  try {
    const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM animals');
    const [speciesResult] = await pool.query('SELECT COUNT(DISTINCT species) as count FROM animals');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayResult] = await pool.query('SELECT COUNT(*) as count FROM animals WHERE DATE(created_at) = DATE(?)', [today]);

    res.json({
      totalAnimals: totalResult[0].count,
      speciesCount: speciesResult[0].count,
      todayAdd: todayResult[0].count,
      recognitions: 75
    });
  } catch (error) {
    log('Stats error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animals', async (req, res) => {
  try {
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
    res.json(animals);
  } catch (error) {
    log('Animals error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }
    const row = rows[0];
    res.json({
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
    });
  } catch (error) {
    log('Animal error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/animals', async (req, res) => {
  try {
    const { name, species, color, features, imageUrl, location } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO animals (name, species, color, features, imageUrl, location_lat, location_lng, location_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || '未命名', species, color, features || '', imageUrl, 
       location ? location.latitude : null, 
       location ? location.longitude : null, 
       location ? location.address : null]
    );
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [result.insertId]);
    const row = rows[0];
    res.status(201).json({
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
    });
  } catch (error) {
    log('Create animal error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stats/latest', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC LIMIT 4');
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
    res.json(animals);
  } catch (error) {
    log('Latest error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/map', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC');
    const mapData = rows.map(row => ({
      id: row.id,
      name: row.name,
      species: row.species,
      color: row.color,
      imageUrl: row.imageUrl,
      location: {
        latitude: parseFloat(row.location_lat),
        longitude: parseFloat(row.location_lng),
        address: row.location_address
      }
    }));
    res.json(mapData);
  } catch (error) {
    log('Map error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/map/filter', async (req, res) => {
  try {
    const { species } = req.query;
    const [rows] = await pool.query('SELECT * FROM animals WHERE species = ? ORDER BY created_at DESC', [species]);
    const mapData = rows.map(row => ({
      id: row.id,
      name: row.name,
      species: row.species,
      color: row.color,
      imageUrl: row.imageUrl,
      location: {
        latitude: parseFloat(row.location_lat),
        longitude: parseFloat(row.location_lng),
        address: row.location_address
      }
    }));
    res.json(mapData);
  } catch (error) {
    log('Map filter error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animals/search/query', async (req, res) => {
  try {
    const { query } = req.query;
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT * FROM animals WHERE name LIKE ? OR features LIKE ? OR species LIKE ? ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm]
    );
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
    res.json(animals);
  } catch (error) {
    log('Search error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animals/filter/species', async (req, res) => {
  try {
    const { species } = req.query;
    const [rows] = await pool.query('SELECT * FROM animals WHERE species = ? ORDER BY created_at DESC', [species]);
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
    res.json(animals);
  } catch (error) {
    log('Filter error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传图片' });
    }
    
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    log('Upload error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/recognition/image', upload.single('image'), (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  const speciesList = ['猫', '狗', '其他'];
  const species = speciesList[Math.floor(Math.random() * speciesList.length)];
  
  const colorList = ['黑色', '白色', '黄色', '棕色', '花斑', '灰色'];
  const color = colorList[Math.floor(Math.random() * colorList.length)];
  
  const featuresList = [
    '体型较大，性格温顺',
    '经常在教学楼附近活动',
    '尾巴有白色斑块，性格粘人',
    '短毛，耳朵下垂',
    '毛发蓬松，喜欢晒太阳'
  ];
  const features = featuresList[Math.floor(Math.random() * featuresList.length)];
  
  res.json({
    species: species,
    color: color,
    confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
    features: features,
    imageUrl: imageUrl
  });
});

app.get('/', (req, res) => {
  res.json({ message: '校园流浪动物管理系统后端API' });
});

initDB().then(() => {
  log('启动服务器...');
  app.listen(PORT, '0.0.0.0', () => {
    log('服务器运行在 http://localhost:' + PORT);
  });
}).catch(err => {
  log('初始化失败: ' + err.stack);
  process.exit(1);
});