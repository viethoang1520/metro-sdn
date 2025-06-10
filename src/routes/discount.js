const express = require('express')
const router = express.Router()
const { applyDiscountForStudent } = require('../app/controllers/discountController')
router.post('/student', applyDiscountForStudent)

module.exports = router