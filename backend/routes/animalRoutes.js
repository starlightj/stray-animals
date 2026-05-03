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
    const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC');
    res.json(rows.map(formatAnimal));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }
    res.json(formatAnimal(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, species, color, features, imageUrl, location } = req.body;
    const [result] = await pool.query(
      `INSERT INTO animals (name, species, color, features, imageUrl, location_lat, location_lng, location_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || '未命名', species, color, features || '', imageUrl, location.latitude, location.longitude, location.address]
    );
    
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [result.insertId]);
    res.status(201).json(formatAnimal(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }

    const { name, species, color, features, imageUrl, location } = req.body;
    const current = existing[0];
    
    await pool.query(
      `UPDATE animals SET name = ?, species = ?, color = ?, features = ?, imageUrl = ?, location_lat = ?, location_lng = ?, location_address = ? WHERE id = ?`,
      [
        name || current.name,
        species || current.species,
        color || current.color,
        features !== undefined ? features : current.features,
        imageUrl || current.imageUrl,
        location ? location.latitude : current.location_lat,
        location ? location.longitude : current.location_lng,
        location ? location.address : current.location_address,
        req.params.id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    res.json(formatAnimal(rows[0]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '动物不存在' });
    }

    await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id]);
    res.json({ message: '动物已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/filter/species', async (req, res) => {
  try {
    const { species } = req.query;
    const [rows] = await pool.query('SELECT * FROM animals WHERE species = ? ORDER BY created_at DESC', [species]);
    res.json(rows.map(formatAnimal));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search/query', async (req, res) => {
  try {
    const { query } = req.query;
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT * FROM animals WHERE name LIKE ? OR features LIKE ? OR species LIKE ? ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm]
    );
    res.json(rows.map(formatAnimal));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;