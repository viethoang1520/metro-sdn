const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginUser = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    return res.json({ "error_code": 1, "message": "Người dùng chưa được đăng ký" })
  }

  
  const validUser = await bcrypt.compare(password, user.password_hash)

  if (validUser) {
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET)
    return res.json({ "error_code": 0, "message": "Đăng nhập thành công!", token, "isAdmin": user.isAdmin })
  } else {
    return res.json({ "error_code": 2, "message": "Mật khẩu không đúng" })
  }
}

module.exports = { loginUser }