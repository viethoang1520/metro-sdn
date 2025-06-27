const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');

router.get('/stats/summary', adminController.getSummary);
router.get('/stats/tickets-by-month', adminController.getTicketsByMonth);

module.exports = router; 