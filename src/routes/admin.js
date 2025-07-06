const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');

// http://localhost:3000/admin/today-total-summary
router.get('/today-total-summary', adminController.getTodayAndTotalSummary);

module.exports = router;