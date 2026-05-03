const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

router.get('/filter', async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;