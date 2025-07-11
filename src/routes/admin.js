const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');

// http://localhost:3000/admin/today-total-summary
router.get('/today-total-summary', adminController.getTodayAndTotalSummary);

// http://localhost:3000/admin/station-status-today
router.get('/station-status-today', adminController.getStationStatusToday);

module.exports = router;