const mongoose = require('mongoose');

const Transaction = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticket_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    }],
    total_price: {
        type: Number,
        required: true
    },
    method: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
},{
    timestamps: true
});

module.exports = mongoose.model('transactions', Transaction)