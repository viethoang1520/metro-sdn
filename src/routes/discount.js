const express = require('express')
const router = express.Router()
const { applyDiscountForStudent, applyFreeTicket } = require('../app/controllers/discountController')

router.post('/student', applyDiscountForStudent)
router.post('/free', applyFreeTicket )

module.exports = router