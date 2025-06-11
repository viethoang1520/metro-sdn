const mongoose = require('mongoose');

const Transaction = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    ticket_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        require: true
    }],
    total_price: {
        type: Number,
        require: true
    },
    method: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        require: true
    },
},{
    timestamps: true
});

module.exports = mongoose.model('transactions', Transaction)