const mongoose = require('mongoose');

const Timetable = new mongoose.Schema({
    start_time: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('timetables', Timetable)