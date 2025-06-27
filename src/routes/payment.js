const express = require('express')
const router = express.Router()
const { createPayment, receiveWebhook } = require('../app/controllers/PayOSController')

router.post('/create-payment', createPayment)
router.post('/webhook', receiveWebhook)

module.exports = router