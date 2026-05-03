const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');

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

app.use(cors());
app.use(express.json());

let pool;

async function initDB() {
  try {
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'YxY13830268572!',
      database: 'campus_animal',
      waitForConnections: true,
      connectionLimit: 10
    });
    log('数据库连接池创建成功');

    const connection = await pool.getConnection();
    log('数据库连接测试成功');
    connection.release();
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
      [name || '未命名', species, color, features || '', imageUrl, location.latitude, location.longitude, location.address]
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

app.post('/api/recognition/image', (req, res) => {
  const mockResults = [
    { species: '猫', color: '橘色', confidence: 0.95, features: '体型中等，耳朵竖立' },
    { species: '狗', color: '黄色', confidence: 0.88, features: '体型较大，四肢粗壮' },
    { species: '猫', color: '白色', confidence: 0.92, features: '蓝眼睛，长毛' }
  ];
  const result = mockResults[Math.floor(Math.random() * mockResults.length)];
  res.json({ success: true, data: result });
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