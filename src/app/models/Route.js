const mongoose = require('mongoose')

const Schedule = new mongoose.Schema({
    station: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'stations',
        type: String,
        required: true
    },
    gap_time: {
        type: Number,
        required: true
    }
}, {
    _id: false
});
const Route = new mongoose.Schema({
    direction: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    start_time: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'timetables',
        required: true
    },
    schedule: {
        type: [Schedule],
        required: true,
    },
    status: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('routes', Route)