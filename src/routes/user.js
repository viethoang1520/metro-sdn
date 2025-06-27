const express = require('express')
const { updateUserInformation, getUserInformation } = require('../app/controllers/userController')
const router = express.Router()

router.get('/', getUserInformation)
router.post('/update', updateUserInformation)

module.exports = router