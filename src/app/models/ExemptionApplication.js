const mongoose = require('mongoose')
const ExemptionApplication = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    enum: ['STUDENT', 'SENIOR', 'VETERAN', 'CHILD', 'DISABLED'],
  },
  expiry_date: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  },
  cccd: {
    type: String,
    required: true,
    length: 12,
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('exemption_applications', ExemptionApplication)