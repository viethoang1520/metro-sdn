const express = require('express')
const router = express.Router()
const { createPayment, handleReturn } = require('../app/controllers/VNPayController')

router.post('/create-payment', createPayment)
router.get('/vnpay-return', handleReturn)

module.exports = router