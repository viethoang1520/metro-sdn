const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SystemLog = new mongoose.Schema({
    log_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    log_type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    log_time: {
        type: Date,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

module.exports = mongoose.model('system_logs', SystemLog)
