const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['attendance', 'test', 'fee', 'registration', 'alert', 'course', 'assignment', 'certificate', 'general'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    read: {
        type: Boolean,
        default: false,
    },
    channels: [{
        type: String,
        enum: ['in-app', 'email', 'sms', 'push'],
    }],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    scheduledFor: Date,
    sentAt: Date,
    readAt: Date,
}, {
    timestamps: true,
});

// Indexes for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
