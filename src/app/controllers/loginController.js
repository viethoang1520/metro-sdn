const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginUser = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    return res.json({ "message": "User has not been registed yet" })
  }

  const validUser = await bcrypt.compare(password, user.password_hash)

  if (validUser) {
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET)
    return res.json({ "message": "User logged in !!", token })
  } else {
    return res.json({ "message": "Incorrect password" })
  }
}

module.exports = { loginUser }