const User = require('../models/User')

const applyDiscountForStudent = async (req, res) => {
  try {
    const { userID, discount, expiryDate } = req.body
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ "message": "User has not registered yet" })
    }
    const updateUserDiscount = await User.updateOne({ _id: userID }, {
      $set: {
        'passenger_categories.passenger_type': 'STUDENT',
        'passenger_categories.discount': discount,
        'passenger_categories.expiry_date': expiryDate,
      }
    })
    return res.json({ "message": "Student discount applied!!", updateUserDiscount })
  } catch (error) {
    console.log(error.message)
  }
}

const applyFreeTicket = async (req, res) => {
  const { userID, userType, expiryDate } = req.body
  const user = await User.findById(userID)
  if (!user) {
    return res.status(404).json({ "message": "User not found" })
  }
  await User.updateOne({ _id: user._id }, {
    $set: {
      'passenger_categories.passenger_type': userType,
      'passenger_categories.expiry_date': expiryDate || null,
    }
  })

  return res.json({"message": "Apply free ticket sucessfully"})
}


module.exports = { applyDiscountForStudent, applyFreeTicket }