const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');

// http://localhost:3000/admin/today-total-summary
router.get('/today-total-summary', adminController.getTodayAndTotalSummary);

// http://localhost:3000/admin/station-status-today
router.get('/station-status-today', adminController.getStationStatusToday);

// http://localhost:3000/admin/disable-user/:userId
router.patch('/disable-user/:userId', adminController.disableUser);

// http://localhost:3000/admin/enable-user/:userId
router.patch('/enable-user/:userId', adminController.enableUser);

// http://localhost:3000/admin/users
router.get('/users', adminController.getAllUsers);
module.exports = router;