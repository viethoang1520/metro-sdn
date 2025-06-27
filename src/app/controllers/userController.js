const User = require("../models/User")

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
          return res.json({error_code: 0, message: 'Test'})
     } catch (error) {
          console.log(error.message)
     }
}

module.exports = { updateUserInformation, updateUserPassword }