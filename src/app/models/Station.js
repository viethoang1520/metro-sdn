const mongoose = require('mongoose');

const Station = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    prev_station: {
        type: String,
        required: false
    },
    next_station: {
        type: String,
        required: false
    },
    distance: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('stations', Station)