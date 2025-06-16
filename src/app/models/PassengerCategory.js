const mongoose = require('mongoose');

const PassengerCategorySchema = new mongoose.Schema({
    passenger_type: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    expiry_date: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('passenger_categories', PassengerCategorySchema); 