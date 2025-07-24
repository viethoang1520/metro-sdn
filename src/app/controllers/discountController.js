const User = require('../models/User')
const ExemptionApplication = require('../models/ExemptionApplication')
const mongoose = require('mongoose')
const applyDiscountForStudent = async (req, res) => {
  try {
    const user_id = req.id
    const { discount, expiry_date, cccd } = req.body

    const existingCCCD = await User.findOne({ cccd: cccd })
    if (existingCCCD) {
      return res.json({ "error_code": 5, "message": "CCCD đã được sử dụng" })
    }
    const existingExemptionApplication = await ExemptionApplication.findOne({ user_id: user_id, status: 'PENDING' })
    if (existingExemptionApplication) {
      return res.json({ "error_code": 4, "message": "Bạn đã đăng ký một đơn trước đó" })
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.json({ "error_code": 1, "message": "Người dùng không hợp lệ" })
    }
    if (expiry_date == null || expiry_date == undefined) {
      return res.json({ "error_code": 2, "message": "Sinh viên phải có ngày hết hạn" })
    }

    const user = await User.findById(user_id)
    if (!user) {
      return res.json({ "error_code": 3, "message": "Người dùng chưa đăng ký" })
    }
    const updateUserDiscount = await User.updateOne({ _id: user_id }, {
      $set: {
        'passenger_categories.passenger_type': 'STUDENT',
        'passenger_categories.discount': discount,
        'passenger_categories.expiry_date': expiry_date,
        'passenger_categories.status': 'PENDING',
        'cccd': cccd,
      }
    })

    const exemptionApplication = new ExemptionApplication({
      user_id: user_id,
      user_type: 'STUDENT',
      expiry_date: expiry_date,
      status: 'PENDING',
      cccd: cccd
    })
    await exemptionApplication.save()
    return res.json({ "error_code": 0, "message": "Áp dụng giảm giá cho sinh viên thành công!", updateUserDiscount })
  } catch (error) {
    console.log(error.message)
  }
}

const applyFreeTicket = async (req, res) => {
  try {
    const user_id = req.id
    let { user_type, expiry_date, cccd } = req.body
    const existingCCCD = await User.findOne({ cccd: cccd })
    if (existingCCCD) {
      return res.json({ "error_code": 5, "message": "CCCD đã được sử dụng" })
    }
    const existingExemptionApplication = await ExemptionApplication.findOne({ user_id: user_id, status: 'PENDING' })
    if (existingExemptionApplication) {
      return res.json({ "error_code": 4, "message": "Bạn đã đăng ký một đơn trước đó" })
    }
    if (user_type == 'child' && (expiry_date == null || expiry_date == undefined)) {
      return res.json({ "error_code": 2, "message": "Trẻ em phải có ngày hết hạn" })
    }
    if (user_type !== 'child') {
      expiry_date = null
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.json({ "message": "Người dùng không hợp lệ" })
    }
    const user = await User.findById(user_id)
    if (!user) {
      return res.json({ "error_code": 3, "message": "Không tìm thấy người dùng" })
    }
    await User.updateOne({ _id: user._id }, {
      $set: {
        'passenger_categories.passenger_type': user_type.toUpperCase(),
        'passenger_categories.expiry_date': expiry_date || null,
        'passenger_categories.status': 'PENDING',
        'cccd': cccd,
      }
    })
    const exemptionApplication = new ExemptionApplication({
      user_id: user_id,
      user_type: user_type.toUpperCase(),
      expiry_date: expiry_date || null,
      status: 'PENDING',
      cccd: cccd
    })
    await exemptionApplication.save()
    return res.json({ "error_code": 0, "message": "Áp dụng vé miễn phí thành công!" })
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = { applyDiscountForStudent, applyFreeTicket }