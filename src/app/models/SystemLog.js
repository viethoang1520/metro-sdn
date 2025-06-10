const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SystemLog = new mongoose.Schema({
    log_id: {
        type: String,
        require: true,
        unique: true,
        default: uuidv4,
    },
    log_type: {
        type: String,
        require: true
    },
    message: {
        type: String,
        require: true
    },
    log_time: {
        type: Date,
        require: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: false
    }
});

module.exports = mongoose.model('system_logs', SystemLog)
