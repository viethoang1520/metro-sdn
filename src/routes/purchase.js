const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/purchaseController');

router.post('/type', ticketController.purchaseTicketsByType);
router.post('/route', ticketController.purchaseTicketByRoute);

module.exports = router; 