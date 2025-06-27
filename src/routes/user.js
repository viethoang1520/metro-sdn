const express = require('express')
const { updateUserInformation } = require('../app/controllers/userController')
const router = express.Router()

router.post('/update', updateUserInformation)

module.exports = router