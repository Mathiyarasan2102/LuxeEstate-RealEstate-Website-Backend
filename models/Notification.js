const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Notification'
    },
    type: {
        type: String, // 'info', 'success', 'warning', 'error'
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
