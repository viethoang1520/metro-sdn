const User = require("../models/User")
const jwt = require('jsonwebtoken')

const getUserInformation = async (req, res) => {
     try {
          const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
          let _id = null
          jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
               if (err) {
                    return res.status(403).json({ message: 'Invalid token' })
               }
               const { id } = decoded
               _id = id
          })
          const user = await User.findById(_id).select('-password_hash -__v -createdAt -updatedAt')
          if (!user) return res.json({ error_code: 1, message: 'User not found' })
          return res.json({ error_code: 0, user })
     } catch (error) {
          console.log(error.message)
          return res.status(500).json({ error_code: 1, message: error.message })
     }
}

const updateUserInformation = async (req, res) => {
     try {
          const { full_name, email, _id } = req.body
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const newInformation = { full_name, email }

          if (email && !emailRegex.test(email)) return res.json({ error_code: 1, message: 'Invalid email format' })

          const updateUser = await User.findByIdAndUpdate(
               _id,
               { $set: newInformation },
               { new: true }
          )

          if (!updateUser) return res.json({ error_code: 1, message: 'UserID not found' })
          
          return res.json({ error_code: 0, message: 'Profile updated sucessfully' })
     } catch (error) {
          console.log(error.message)
          return res.status(500).json({ error_code: 1, message: error.message })
     }
}

const updateUserPassword = async (req, res) => {
     try {
          console.log(req)
          return res.json({ error_code: 0, message: 'Test' })
     } catch (error) {
          console.log(error.message)
          return res.status(500).json({ error_code: 1, message: error.message })
     }
}

module.exports = { getUserInformation, updateUserInformation, updateUserPassword }