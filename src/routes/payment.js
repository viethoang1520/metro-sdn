const express = require('express')
const router = express.Router()
const { createPayment, receiveWebhook } = require('../app/controllers/PayOSController')
const authenticateJWT = require('../middleware/AuthenticateJWT')

router.post('/create-payment', authenticateJWT, createPayment)
router.post('/webhook', receiveWebhook)

module.exports = router