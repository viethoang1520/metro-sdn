const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/purchaseController');

router.post('/ticket', ticketController.purchaseTicket);

module.exports = router; 