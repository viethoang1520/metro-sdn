const express = require('express')
const router = express.Router()
const {registerUser} = require('../app/controllers/registerController')

router.post('/validate', registerUser )
module.exports = router