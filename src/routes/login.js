const express = require('express')
const router = express.Router()
const { loginUser } = require('../app/controllers/loginController')

router.post('/validate', loginUser)

module.exports = router