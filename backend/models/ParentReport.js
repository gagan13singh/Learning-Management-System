const mongoose = require('mongoose');

const parentReportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    channel: {
        type: String,
        enum: ['email', 'sms', 'whatsapp'],
        required: true,
    },
    template: {
        type: String,
        enum: ['at-risk', 'critical', 'custom'],
        default: 'at-risk',
    },
    subject: String,
    message: {
        type: String,
        required: true,
    },
    recipientEmail: String,
    recipientPhone: String,
    status: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending',
    },
    sentAt: Date,
    errorMessage: String,
}, {
    timestamps: true,
});

// Index for faster queries
parentReportSchema.index({ student: 1, sentAt: -1 });
parentReportSchema.index({ sentBy: 1 });

module.exports = mongoose.model('ParentReport', parentReportSchema);
