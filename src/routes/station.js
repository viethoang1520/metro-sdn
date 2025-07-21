const express = require('express');
const router = express.Router();
const stationController = require('../app/controllers/stationController');

router.get('/', stationController.getAllStations);
router.post('/', stationController.createStation);
router.patch('/:id', stationController.updateStationStatusById);

module.exports = router;
