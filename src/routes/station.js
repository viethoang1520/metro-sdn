const express = require('express');
const router = express.Router();
const stationController = require('../app/controllers/stationController');

router.get('/', stationController.getAllStations);

module.exports = router;
