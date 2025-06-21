const mongoose = require('mongoose')
const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password_hash: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  full_name: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    required: true,
    default: 1,
  },
  age: {
    type: Number,
    required: false,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'passenger_categories',
    required: false
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('users', User)