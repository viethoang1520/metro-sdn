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
        required: true
    },
    next_station: {
        type: String,
        required: true
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