const mongoose = require('mongoose')

const Schedule = new mongoose.Schema({
    station: {
        type: String,
        require: true
    },
    gap_time: {
        type: Number,
        require: true
    }
},{
    _id: false
});
const Route = new mongoose.Schema({
    direction: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true
    },
    start_time: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timetable',
        required: true
    },
    schedule: {
        type: Schedule,
        require: true,
    },
    status: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('routes', Route)