const express = require('express')
const router = express.Router()
const { createPayment } = require('../app/controllers/PayOSController')

router.post('/create-payment', createPayment)

module.exports = router