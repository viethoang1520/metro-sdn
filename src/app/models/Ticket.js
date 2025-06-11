const mongoose = require('mongoose');


const TicketType = new mongoose.Schema({
    expiry_date: {
        type: Date,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    base_price: {
        type: Number,
        require: true
    }
},{
    _id: false
})
const Ticket = new mongoose.Schema({
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: false
    },
    ticket_type: {
        type: TicketType,
        require: false
    },
    start_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        require: false
    },
    end_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        require: false
    },
    route_price: {
        type: Number,
        require: false
    },
    status: {
        type: String,
        require: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('tickets', Ticket)