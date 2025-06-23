const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/purchaseController');

router.post('/ticket', (req, res) => {
  console.log(req.body); // Xem payload FE gửi lên
  ticketController.purchaseTicket(req, res);
});

module.exports = router; 