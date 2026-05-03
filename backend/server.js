const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await initDatabase();
    console.log('数据库连接成功');

    const animalRoutes = require('./routes/animalRoutes');
    const recognitionRoutes = require('./routes/recognitionRoutes');
    const statsRoutes = require('./routes/statsRoutes');
    const mapRoutes = require('./routes/mapRoutes');

    app.use('/api/animals', animalRoutes);
    app.use('/api/recognition', recognitionRoutes);
    app.use('/api/stats', statsRoutes);
    app.use('/api/map', mapRoutes);

    app.get('/', (req, res) => {
      res.json({ message: '校园流浪动物管理系统后端API (MySQL)' });
    });

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();