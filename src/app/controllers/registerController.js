const User = require('../models/User')
const bcrypt = require('bcrypt')

const registerUser = async (req, res) => {
  try {
    const { username, password, full_name } = req.body 
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.json({ "error_code": 1,"message": "Người dùng đã tồn tại" })
    }
    const password_hash = (await (bcrypt.hash(password, 10))).toString()
    const saveUser = new User({
      username, password_hash, full_name
    })
    await saveUser.save()
    return res.json({ "error_code": 0,"message": "Người dùng đã được tạo thành công" })
  } catch (error) {
    console.log(error.message)
  }

}

module.exports = { registerUser }