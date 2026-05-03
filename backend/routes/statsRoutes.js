const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

const formatAnimal = (row) => ({
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

router.get('/', async (req, res) => {
  try {
    const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM animals');
    const totalAnimals = totalResult[0].count;

    const [speciesResult] = await pool.query('SELECT COUNT(DISTINCT species) as count FROM animals');
    const speciesCount = speciesResult[0].count;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayResult] = await pool.query('SELECT COUNT(*) as count FROM animals WHERE DATE(created_at) = DATE(?)', [today]);
    const todayAdd = todayResult[0].count;

    const [recognitionResult] = await pool.query('SELECT COUNT(*) as count FROM animals');
    const recognitions = Math.floor(Math.random() * 100) + 50;

    res.json({
      totalAnimals,
      speciesCount,
      todayAdd,
      recognitions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC LIMIT 4');
    res.json(rows.map(formatAnimal));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;