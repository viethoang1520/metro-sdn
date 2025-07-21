const express = require('express');
const router = express.Router();
const stationController = require('../app/controllers/stationController');

router.get('/', stationController.getAllStations);
router.post('/', stationController.createStation);

module.exports = router;
