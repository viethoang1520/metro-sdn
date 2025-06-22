const User = require('../models/User')
const mongoose = require('mongoose')
const applyDiscountForStudent = async (req, res) => {
  try {
    const { user_id, discount, expiry_date } = req.body
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.json({ "error_code": 1,"message": "Người dùng không hợp lệ" })
    }
    if (expiry_date == null || expiry_date == undefined) {
      return res.json({ "error_code": 2,"message": "Sinh viên phải có ngày hết hạn" })
    }
    const user = await User.findById(user_id)
    if (!user) {
      return res.json({ "error_code": 3,"message": "Người dùng chưa đăng ký" })
    }
    const updateUserDiscount = await User.updateOne({ _id: user_id }, {
      $set: {
        'passenger_categories.passenger_type': 'STUDENT',
        'passenger_categories.discount': discount,
        'passenger_categories.expiry_date': expiry_date,
      }
    })
    return res.json({ "error_code": 0,"message": "Áp dụng giảm giá cho sinh viên thành công!", updateUserDiscount })
  } catch (error) {
    console.log(error.message)
  }
}

const applyFreeTicket = async (req, res) => {
  try {
    const { user_id, user_type, expiry_date } = req.body
    if (user_type == 'child' && (expiry_date == null || expiry_date == undefined)) {
      return res.json({ "error_code": 2,"message": "Trẻ em phải có ngày hết hạn" })
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.json({"message": "Người dùng không hợp lệ"})
    }
    const user = await User.findById(user_id)
    if (!user) {
      return res.json({ "error_code": 3,"message": "Không tìm thấy người dùng" })
    }
    await User.updateOne({ _id: user._id }, {
      $set: {
        'passenger_categories.passenger_type': user_type,
        'passenger_categories.expiry_date': expiry_date || null,
      }
    })

    return res.json({ "error_code": 0,"message": "Áp dụng vé miễn phí thành công!" })
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = { applyDiscountForStudent, applyFreeTicket }