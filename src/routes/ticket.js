const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/ticketController');


router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/:userId', ticketController.getAllTicketsByUserId);

module.exports = router;