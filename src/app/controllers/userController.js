const User = require("../models/User")

const getUserInformation = async (req, res) => {
     try {
          const { token } = req.body
          //ID TEST
          const id = '68584a9318332c3c6c6ac629'
          const user = await User.findById(id).select('-password_hash -__v -createdAt -updatedAt')
          if (!user) return res.json({ error_code: 1, message: 'User not found' })
          return res.json({ error_code: 0, user })
     } catch (error) {
          console.log(error.message)
     }
}

const updateUserInformation = async (req, res) => {
     try {
          const { fullName, email, id } = req.body
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const newInformation = {
               full_name: fullName,
               email
          }

          if (email && !emailRegex.test(email)) {
               return res.json({ error_code: 1, message: 'Invalid email format' })
          }

          const updateUser = await User.findByIdAndUpdate(
               id,
               { $set: newInformation },
               { new: true }
          )

          if (!updateUser) return res.json({ error_code: 1, message: 'UserID not found' })
          return res.json({ error_code: 0, message: 'Profile updated sucessfully' })

     } catch (error) {
          console.log(error.message)
     }
}

const updateUserPassword = async (req, res) => {
     try {
          console.log(req)
          return res.json({ error_code: 0, message: 'Test' })
     } catch (error) {
          console.log(error.message)
     }
}

module.exports = { getUserInformation, updateUserInformation, updateUserPassword }