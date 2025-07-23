const express = require('express');
const router = express.Router();
const stationController = require('../app/controllers/stationController');

router.get('/', stationController.getAllStations);
router.get('/all', stationController.getActiveAndInactiveStations);
router.post('/', stationController.createStation);
router.put('/:id', stationController.updateStationStatusById);
router.put('/', stationController.updateStationNameById);

module.exports = router;
