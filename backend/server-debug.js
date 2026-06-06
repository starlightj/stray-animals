const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool, initDatabase } = require('./config/database-sqlite');

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

const UPLOADS_DIR = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 托管前端页面，访问 http://localhost:3000 即可打开
app.use(express.static(path.join(__dirname, '..', 'src')));

async function initDB() {
  try {
    log('正在初始化 SQLite 数据库...');
    initDatabase();
    log('SQLite 数据库初始化成功');
  } catch (error) {
    log('数据库初始化错误: ' + error.stack);
    throw error;
  }
}

app.get('/api/stats', async (req, res) => {
  try {
    const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM animals');
    const [speciesResult] = await pool.query('SELECT COUNT(DISTINCT species) as count FROM animals');
    const [recResult] = await pool.query("SELECT COUNT(*) as count FROM animals WHERE animal_type IS NOT NULL");

    res.json({
      totalAnimals: totalResult[0].count,
      speciesCount: speciesResult[0].count,
      recognitions: recResult[0].count
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
      animal_type: row.animal_type,
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
      animal_type: row.animal_type,
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
    const { name, species, color, features, imageUrl, animal_type, location } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO animals (name, species, color, features, imageUrl, animal_type, location_lat, location_lng, location_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || '未命名', species, color, features || '', imageUrl,
       animal_type || null,
       location ? location.latitude : null, 
       location ? location.longitude : null, 
       location ? location.address : null]
    );
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [result.insertId]);
    const row = rows[0];
    res.status(201).json({
      id: row.id,
      animal_type: row.animal_type,
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

// ======== 管理后台：更新动物 ========
app.put('/api/animals/:id', async (req, res) => {
  try {
    const { name, species, color, features, imageUrl, animal_type, location } = req.body;

    const [result] = await pool.query(
      `UPDATE animals SET name = ?, species = ?, color = ?, features = ?, imageUrl = ?, animal_type = ?,
       location_lat = ?, location_lng = ?, location_address = ? WHERE id = ?`,
      [name || '未命名', species, color || '', features || '', imageUrl || '',
       animal_type || null,
       location ? location.latitude : null,
       location ? location.longitude : null,
       location ? location.address : null,
       req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }

    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    const row = rows[0];
    res.json({
      id: row.id,
      name: row.name,
      species: row.species,
      color: row.color,
      features: row.features,
      imageUrl: row.imageUrl,
      animal_type: row.animal_type,
      location: {
        latitude: parseFloat(row.location_lat),
        longitude: parseFloat(row.location_lng),
        address: row.location_address
      },
      createdAt: row.created_at
    });
  } catch (error) {
    log('Update animal error: ' + error.stack);
    res.status(500).json({ message: error.message });
  }
});

// ======== 管理后台：删除动物 ========
app.delete('/api/animals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }

    await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id]);
    log('已删除动物 ID: ' + req.params.id);
    res.json({ message: '删除成功', id: parseInt(req.params.id) });
  } catch (error) {
    log('Delete animal error: ' + error.stack);
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
      animal_type: row.animal_type,
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
      animal_type: row.animal_type,
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
      animal_type: row.animal_type,
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
      animal_type: row.animal_type,
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
      animal_type: row.animal_type,
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
  // 浏览器访问时显示前端页面，API 请求时返回 JSON
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '..', 'src', '最终演示.html'));
  } else {
    res.json({ message: '校园流浪动物管理系统后端API' });
  }
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