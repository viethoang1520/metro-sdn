const mongoose = require('mongoose');

const Station = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    route: {
        type: String,
        require: true
    },
    prev_station: {
        type: String,
        require: true
    },
    next_station: {
        type: String,
        require: true
    },
    distance: {
        type: Number,
        require: true
    },
    status: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('stations', Station)