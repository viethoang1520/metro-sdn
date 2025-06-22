const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/ticketController');


router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/user/:userId', ticketController.getAllTicketsByUserId);
router.get('/active/:userId', ticketController.getActiveTicketsByUserId);
module.exports = router;