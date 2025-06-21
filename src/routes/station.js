const express = require('express');
const router = express.Router();
const Station = require('../app/models/Station');

router.get('/stations', async (req, res) => {
  try {
    const stations = await Station.find({});
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
