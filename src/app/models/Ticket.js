const mongoose = require('mongoose');


const TicketType = new mongoose.Schema({
    expiry_date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    base_price: {
        type: Number,
        required: true
    }
},{
    _id: false
})
const Ticket = new mongoose.Schema({
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: false
    },
    ticket_type: {
        type: TicketType,
        required: false
    },
    start_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: false
    },
    end_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: false
    },
    route_price: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('tickets', Ticket)