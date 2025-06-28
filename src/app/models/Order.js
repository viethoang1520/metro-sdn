const mongoose = require('mongoose')

const Order = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  order_code: {
    type: String,
    required: true,
    unique: true,
  },
  order_date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'CANCELLED'],
  },
  order_amount: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('orders', Order)