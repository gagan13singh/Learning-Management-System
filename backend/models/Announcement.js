const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Announcement message is required'],
    },
    type: {
        type: String,
        enum: ['general', 'urgent', 'test', 'notes', 'class_cancelled'],
        default: 'general',
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Announcement', announcementSchema);
