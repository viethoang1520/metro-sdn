const mongoose = require('mongoose')

const PassengerCategory = new mongoose.Schema({
  passenger_type: {
    type: String,
    required: false
  },
  discount: {
    type: Number,
    required: false
  },
  expiry_date: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED']
  }
})
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
  passenger_categories: {
    type: PassengerCategory,
    required: false
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
  },
  cccd: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('users', User)