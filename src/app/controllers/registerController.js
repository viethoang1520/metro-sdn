const User = require('../models/User')
const bcrypt = require('bcrypt')
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      res.status(500).json({ "message": "User has been registered" })
    }
    const password_hash = (await (bcrypt.hash(password, 10))).toString()
    const saveUser = new User({
      username, password_hash
    })
    await saveUser.save()
    res.json({ "message": "User saved successfully" })
  } catch (error) {
    console.log(error.message)
  }

}

module.exports = { registerUser }