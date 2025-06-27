const express = require('express')
const router = express.Router()
const { createPayment, handleWebhook } = require('../app/controllers/PayOSController')

router.post('/create-payment', createPayment)
router.post('/webhook', handleWebhook)

module.exports = router