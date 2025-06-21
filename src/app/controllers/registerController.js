const User = require('../models/User')
const bcrypt = require('bcrypt')

const registerUser = async (req, res) => {
  try {
    const { username, password, fullname } = req.body 
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.json({ "error_code": 1,"message": "User has been registered" })
    }
    const password_hash = (await (bcrypt.hash(password, 10))).toString()
    const saveUser = new User({
      username, password_hash
    })
    await saveUser.save()
    return res.json({ "error_code": 0,"message": "User created successfully" })
  } catch (error) {
    console.log(error.message)
  }

}

module.exports = { registerUser }